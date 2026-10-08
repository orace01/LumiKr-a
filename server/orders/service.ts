import { randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import { quote } from '../../src/shop/pricing'
import type { CartLine, CheckoutResponse, CustomerStatus, FieldErrors, PublicOrder, ShopMode } from '../../src/shop/types'
import { normalizeCustomer, validateCustomer } from '../../src/shop/validation'
import { buildCatalog } from '../catalog'
import type { FulfillmentProvider } from '../fulfillment/types'
import type { Notifier } from '../notify'
import type { PaymentEvent, PaymentProvider } from '../payment/types'
import type { OrderStore } from './store'
import type { Order, OrderStatus } from './types'

/** Erreur destinée au client : `status` est le code HTTP, `errors` les champs à corriger. */
export class CheckoutError extends Error {
  readonly status: number
  readonly errors: FieldErrors | undefined

  constructor(status: number, message: string, errors?: FieldErrors) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export interface OrderServiceDeps {
  mode: ShopMode
  store: OrderStore
  payment: PaymentProvider
  fulfillment: FulfillmentProvider
  notifier: Notifier
  /** Intervalle minimal entre deux demandes de suivi au fournisseur. */
  trackingSyncMs?: number
}

const CUSTOMER_STATUS: Record<OrderStatus, CustomerStatus> = {
  pending_payment: 'awaiting_payment',
  payment_failed: 'payment_failed',
  cancelled: 'cancelled',
  paid: 'confirmed',
  // Côté client, une erreur de transmission au fournisseur reste « confirmée » :
  // elle se règle de notre côté (voir POST /api/admin/orders/:id/fulfill).
  fulfillment_error: 'confirmed',
  sent_to_supplier: 'preparing',
  shipped: 'shipped',
  delivered: 'delivered',
}

/** Une commande non payée peut encore recevoir le résultat de son paiement. */
const AWAITING_PAYMENT: OrderStatus[] = ['pending_payment', 'payment_failed', 'cancelled']

// Sans 0/O ni 1/I/L, pour un numéro facile à recopier.
const ID_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

function newOrderId() {
  let id = 'LK-'
  for (let index = 0; index < 6; index++) id += ID_ALPHABET[randomInt(ID_ALPHABET.length)]
  return id
}

function sameSecret(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

function sanitizeLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return []
  return value.slice(0, 20).flatMap((line) =>
    line && typeof line === 'object' && typeof line.variantId === 'string' && typeof line.quantity === 'number'
      ? [{ variantId: line.variantId, quantity: line.quantity }]
      : [],
  )
}

function withStatus(order: Order, status: OrderStatus, note?: string): Order {
  const at = new Date().toISOString()
  return { ...order, status, updatedAt: at, history: [...order.history, { at, status, ...(note ? { note } : {}) }] }
}

export function toPublicOrder(order: Order): PublicOrder {
  const steps: PublicOrder['steps'] = {}
  for (const entry of order.history) steps[CUSTOMER_STATUS[entry.status]] ??= entry.at
  const { carrier, trackingNumber, trackingUrl } = order.fulfillment
  return {
    id: order.id,
    status: CUSTOMER_STATUS[order.status],
    createdAt: order.createdAt,
    currency: order.currency,
    lines: order.lines,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    shippingMethodLabel: order.shippingMethodLabel,
    email: order.customer.email,
    deliverTo: { name: `${order.customer.firstName} ${order.customer.lastName}`, ...order.shippingAddress },
    tracking: carrier || trackingNumber || trackingUrl ? { carrier, trackingNumber, trackingUrl } : null,
    steps,
  }
}

export type OrderService = ReturnType<typeof createOrderService>

export function createOrderService(deps: OrderServiceDeps) {
  const { store, payment, fulfillment, notifier } = deps
  const trackingSyncMs = deps.trackingSyncMs ?? (deps.mode === 'demo' ? 10_000 : 30 * 60_000)

  const catalog = () =>
    buildCatalog(deps.mode, { payment: payment.isConfigured(), fulfillment: fulfillment.isConfigured() })

  async function uniqueId() {
    for (let attempt = 0; attempt < 10; attempt++) {
      const id = newOrderId()
      if (!(await store.get(id))) return id
    }
    throw new Error('Impossible de générer un numéro de commande libre.')
  }

  /** Crée la commande puis la transaction de paiement ; renvoie la page de paiement. */
  async function checkout(body: unknown, origin: string): Promise<CheckoutResponse> {
    const info = catalog()
    if (!info.saleOpen) throw new CheckoutError(503, info.closedReason ?? 'La vente n’est pas ouverte.')

    const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
    const customer = normalizeCustomer((input.customer ?? {}) as Record<string, unknown>)
    const errors = validateCustomer(customer, {
      countries: info.countries.map((country) => country.code),
      shippingMethodIds: info.shippingMethods.map((method) => method.id),
    })
    // Les montants sont recalculés ici, à partir du catalogue du serveur.
    const priced = quote(info, sanitizeLines(input.lines), customer.shippingMethodId)
    if (!priced.ok) errors.lines = priced.reason
    if (Object.keys(errors).length > 0 || !priced.ok) {
      throw new CheckoutError(400, 'Certaines informations sont à corriger.', errors)
    }

    const now = new Date().toISOString()
    const id = await uniqueId()
    const order: Order = {
      id,
      accessKey: randomBytes(18).toString('base64url'),
      createdAt: now,
      updatedAt: now,
      status: 'pending_payment',
      customer: {
        email: customer.email,
        phone: customer.phone,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
      shippingAddress: {
        address1: customer.address1,
        address2: customer.address2,
        postalCode: customer.postalCode,
        city: customer.city,
        region: customer.region,
        country: customer.country,
      },
      shippingMethodId: customer.shippingMethodId,
      shippingMethodLabel: info.shippingMethods.find((method) => method.id === customer.shippingMethodId)?.label ?? '',
      lines: priced.lines,
      subtotalCents: priced.subtotalCents,
      shippingCents: priced.shippingCents ?? 0,
      totalCents: priced.totalCents,
      currency: info.currency,
      payment: { provider: payment.id, reference: null, paidAt: null },
      fulfillment: {
        provider: fulfillment.id,
        supplierOrderId: null,
        carrier: null,
        trackingNumber: null,
        trackingUrl: null,
        lastSyncAt: null,
        error: null,
      },
      history: [{ at: now, status: 'pending_payment' }],
    }
    await store.create(order)

    const returnUrl = new URL('/commande/confirmation', origin)
    returnUrl.searchParams.set('commande', id)
    returnUrl.searchParams.set('cle', order.accessKey)
    const cancelUrl = new URL('/commande', origin)
    cancelUrl.searchParams.set('annule', id)

    try {
      const session = await payment.createPayment({
        order,
        returnUrl: returnUrl.toString(),
        cancelUrl: cancelUrl.toString(),
        notifyUrl: new URL('/api/payments/notify', origin).toString(),
      })
      await store.update(id, (current) => ({ ...current, payment: { ...current.payment, reference: session.reference } }))
      console.info(`[commande] ${id} créée, en attente de paiement (${order.totalCents / 100} ${order.currency})`)
      return { orderId: id, redirectUrl: session.redirectUrl }
    } catch (error) {
      console.error(`[paiement] création impossible pour ${id}`, error)
      await store.update(id, (current) => withStatus(current, 'payment_failed', 'Création du paiement impossible'))
      throw new CheckoutError(502, 'Le service de paiement ne répond pas. Réessayez dans quelques instants.')
    }
  }

  /** Transmet une commande payée au fournisseur. */
  async function fulfill(order: Order) {
    if (!fulfillment.isConfigured()) {
      return store.update(order.id, (current) => ({
        ...withStatus(current, 'fulfillment_error', 'Fournisseur non raccordé'),
        fulfillment: { ...current.fulfillment, error: 'Fournisseur non raccordé' },
      }))
    }
    try {
      const { supplierOrderId } = await fulfillment.createOrder(order)
      console.info(`[fournisseur] ${order.id} transmise (${supplierOrderId})`)
      return store.update(order.id, (current) => ({
        ...withStatus(current, 'sent_to_supplier'),
        fulfillment: { ...current.fulfillment, supplierOrderId, error: null },
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[fournisseur] ${order.id} non transmise : ${message}`)
      return store.update(order.id, (current) => ({
        ...withStatus(current, 'fulfillment_error', 'Transmission au fournisseur impossible'),
        fulfillment: { ...current.fulfillment, error: message },
      }))
    }
  }

  /**
   * Applique le résultat d'un paiement. Sans effet si la commande est déjà
   * payée : le prestataire peut notifier plusieurs fois le même paiement.
   */
  async function handlePaymentEvent(event: PaymentEvent): Promise<Order | null> {
    const found = await store.findByPaymentReference(event.reference)
    if (!found) return null

    // Vérification et changement d'état d'un seul tenant : deux notifications
    // simultanées ne peuvent pas déclencher deux envois au fournisseur.
    let paidNow = false
    const updated = await store.update(found.id, (current) => {
      if (!AWAITING_PAYMENT.includes(current.status)) return current
      if (event.outcome === 'paid') {
        paidNow = true
        return { ...withStatus(current, 'paid'), payment: { ...current.payment, paidAt: new Date().toISOString() } }
      }
      if (current.status !== 'pending_payment') return current
      return withStatus(current, event.outcome === 'failed' ? 'payment_failed' : 'cancelled')
    })

    if (!paidNow) return updated
    console.info(`[paiement] ${updated.id} payée`)
    await notifier.orderPaid(updated).catch((error) => console.error('[notification]', error))
    return fulfill(updated)
  }

  /** Met à jour l'expédition auprès du fournisseur, au plus une fois par intervalle. */
  async function syncTracking(order: Order): Promise<Order> {
    if (order.status !== 'sent_to_supplier' && order.status !== 'shipped') return order
    const last = order.fulfillment.lastSyncAt ? Date.parse(order.fulfillment.lastSyncAt) : 0
    if (Date.now() - last < trackingSyncMs) return order

    try {
      const tracking = await fulfillment.getTracking(order)
      let shippedNow = false
      const updated = await store.update(order.id, (current) => {
        let next: Order = { ...current, fulfillment: { ...current.fulfillment, lastSyncAt: new Date().toISOString() } }
        if (!tracking) return next
        next = {
          ...next,
          fulfillment: {
            ...next.fulfillment,
            carrier: tracking.carrier ?? next.fulfillment.carrier,
            trackingNumber: tracking.trackingNumber ?? next.fulfillment.trackingNumber,
            trackingUrl: tracking.trackingUrl ?? next.fulfillment.trackingUrl,
          },
        }
        if (tracking.status === 'cancelled') {
          // Annulée chez le fournisseur : le client a payé, c'est à l'administrateur
          // de décider (nouvelle commande chez CJ ou remboursement).
          const error = 'Commande annulée chez le fournisseur : passer une nouvelle commande dans CJ ou rembourser le client.'
          return {
            ...withStatus(next, 'fulfillment_error', 'Annulée chez le fournisseur'),
            fulfillment: { ...next.fulfillment, error },
          }
        }
        if (tracking.status !== 'processing' && next.status === 'sent_to_supplier') {
          next = withStatus(next, 'shipped')
          shippedNow = true
        }
        if (tracking.status === 'delivered' && next.status === 'shipped') next = withStatus(next, 'delivered')
        return next
      })
      if (shippedNow) await notifier.orderShipped(updated).catch((error) => console.error('[notification]', error))
      return updated
    } catch (error) {
      console.warn(`[fournisseur] suivi indisponible pour ${order.id}`, error)
      return order
    }
  }

  /**
   * Suivi de toutes les commandes en cours d'acheminement, à appeler à
   * intervalles réguliers : le client est prévenu de l'expédition même s'il ne
   * consulte pas sa commande. Une commande à la fois (limites d'appels CJ).
   */
  async function syncAll() {
    for (const order of await store.list()) {
      if (order.status === 'sent_to_supplier' || order.status === 'shipped') await syncTracking(order)
    }
  }

  /** Lien de confirmation : numéro de commande + clé secrète. */
  async function getForCustomer(id: string, accessKey: string): Promise<PublicOrder | null> {
    let order = await store.get(id)
    if (!order || !sameSecret(accessKey, order.accessKey)) return null

    // Le client revient parfois avant la notification du prestataire.
    if (order.status === 'pending_payment' && order.payment.reference && payment.fetchStatus) {
      const outcome = await payment.fetchStatus(order.payment.reference).catch(() => 'pending' as const)
      if (outcome !== 'pending') order = (await handlePaymentEvent({ reference: order.payment.reference, outcome })) ?? order
    }
    return toPublicOrder(await syncTracking(order))
  }

  /** Page de suivi : numéro de commande + e-mail utilisé pour commander. */
  async function lookup(id: string, email: string): Promise<PublicOrder | null> {
    const order = await store.get(id.trim().toUpperCase())
    if (!order || order.customer.email !== email.trim().toLowerCase()) return null
    return toPublicOrder(await syncTracking(order))
  }

  /** Relance la transmission au fournisseur d'une commande payée restée en erreur. */
  async function retryFulfillment(id: string): Promise<Order | null> {
    const order = await store.get(id)
    if (!order) return null
    if (order.status !== 'fulfillment_error' && order.status !== 'paid') return order
    return fulfill(order)
  }

  return {
    catalog,
    checkout,
    handlePaymentEvent,
    getForCustomer,
    lookup,
    retryFulfillment,
    syncAll,
    listOrders: () => store.list(),
  }
}

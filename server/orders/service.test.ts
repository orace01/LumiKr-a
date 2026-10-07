import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FulfillmentProvider } from '../fulfillment/types'
import type { Notifier } from '../notify'
import { DemoPaymentProvider } from '../payment/demo'
import { CheckoutError, createOrderService } from './service'
import { MemoryOrderStore } from './store'

const customer = {
  email: 'camille@exemple.fr',
  phone: '0612345678',
  firstName: 'Camille',
  lastName: 'Martin',
  address1: '12 rue des Lilas',
  address2: '',
  postalCode: '75011',
  city: 'Paris',
  region: '',
  country: 'FR',
  shippingMethodId: 'standard',
  acceptTerms: true,
}
const ORIGIN = 'https://boutique.test'

function setup(options: { fulfillmentFails?: boolean } = {}) {
  const store = new MemoryOrderStore()
  const payment = new DemoPaymentProvider()
  const fulfillment: FulfillmentProvider = {
    id: 'fake',
    isConfigured: () => true,
    createOrder: vi.fn(async (order) => {
      if (options.fulfillmentFails) throw new Error('stock épuisé')
      return { supplierOrderId: `CJ-${order.id}` }
    }),
    getTracking: vi.fn(async () => ({ status: 'shipped' as const, carrier: 'Colissimo', trackingNumber: 'XY123', trackingUrl: null })),
  }
  const notifier: Notifier = { orderPaid: vi.fn(async () => {}), orderShipped: vi.fn(async () => {}) }
  const service = createOrderService({ mode: 'demo', store, payment, fulfillment, notifier, trackingSyncMs: 0 })
  return { store, payment, fulfillment, notifier, service }
}

async function placeOrder(env: ReturnType<typeof setup>) {
  const { orderId, redirectUrl } = await env.service.checkout(
    { customer, lines: [{ variantId: '20x20', quantity: 2 }] },
    ORIGIN,
  )
  const reference = new URL(redirectUrl).searchParams.get('ref')!
  return { orderId, reference }
}

describe('commande', () => {
  let env: ReturnType<typeof setup>
  beforeEach(() => {
    env = setup()
  })

  it('enregistre la commande en attente de paiement et renvoie la page de paiement', async () => {
    const { orderId, reference } = await placeOrder(env)
    const order = (await env.store.get(orderId))!
    expect(orderId).toMatch(/^LK-[2-9A-HJ-NP-Z]{6}$/)
    expect(order.status).toBe('pending_payment')
    expect(order.payment.reference).toBe(reference)
    // Prix de démonstration du 20 × 20 (20,00) × 2 + livraison de démo (5,00).
    expect(order.totalCents).toBe(4500)
  })

  it('recalcule les montants sans tenir compte de ce que le navigateur envoie', async () => {
    const { orderId } = await env.service.checkout(
      { customer, lines: [{ variantId: '20x20', quantity: 1, unitPriceCents: 1 }], totalCents: 1 },
      ORIGIN,
    )
    expect((await env.store.get(orderId))!.totalCents).toBe(2500)
  })

  it('refuse un formulaire incomplet avec le détail des champs', async () => {
    const attempt = env.service.checkout({ customer: { ...customer, email: '' }, lines: [] }, ORIGIN)
    await expect(attempt).rejects.toBeInstanceOf(CheckoutError)
    await attempt.catch((error: CheckoutError) => {
      expect(error.status).toBe(400)
      expect(error.errors).toHaveProperty('email')
      expect(error.errors).toHaveProperty('lines')
    })
    expect(await env.store.list()).toHaveLength(0)
  })

  it('une fois payée, transmet la commande au fournisseur une seule fois', async () => {
    const { orderId, reference } = await placeOrder(env)
    await env.service.handlePaymentEvent({ reference, outcome: 'paid' })
    // Le prestataire peut notifier plusieurs fois le même paiement.
    await env.service.handlePaymentEvent({ reference, outcome: 'paid' })
    await Promise.all([
      env.service.handlePaymentEvent({ reference, outcome: 'paid' }),
      env.service.handlePaymentEvent({ reference, outcome: 'paid' }),
    ])

    const order = (await env.store.get(orderId))!
    expect(order.status).toBe('sent_to_supplier')
    expect(order.fulfillment.supplierOrderId).toBe(`CJ-${orderId}`)
    expect(env.fulfillment.createOrder).toHaveBeenCalledTimes(1)
    expect(env.notifier.orderPaid).toHaveBeenCalledTimes(1)
  })

  it('un paiement refusé ne déclenche aucun envoi', async () => {
    const { orderId, reference } = await placeOrder(env)
    await env.service.handlePaymentEvent({ reference, outcome: 'failed' })
    expect((await env.store.get(orderId))!.status).toBe('payment_failed')
    expect(env.fulfillment.createOrder).not.toHaveBeenCalled()
  })

  it('garde trace d’une erreur du fournisseur sans la montrer au client', async () => {
    env = setup({ fulfillmentFails: true })
    const { orderId, reference } = await placeOrder(env)
    await env.service.handlePaymentEvent({ reference, outcome: 'paid' })
    const order = (await env.store.get(orderId))!
    expect(order.status).toBe('fulfillment_error')
    expect(order.fulfillment.error).toBe('stock épuisé')

    const seen = await env.service.getForCustomer(orderId, order.accessKey)
    expect(seen?.status).toBe('confirmed')
    expect(JSON.stringify(seen)).not.toContain('stock épuisé')
  })

  it('n’ouvre la commande qu’avec la bonne clé, ou le bon e-mail', async () => {
    const { orderId } = await placeOrder(env)
    const order = (await env.store.get(orderId))!
    expect(await env.service.getForCustomer(orderId, 'mauvaise-cle')).toBeNull()
    expect(await env.service.getForCustomer(orderId, order.accessKey)).toMatchObject({ id: orderId, status: 'awaiting_payment' })
    expect(await env.service.lookup(orderId, 'autre@exemple.fr')).toBeNull()
    expect(await env.service.lookup(orderId.toLowerCase(), ' Camille@Exemple.fr ')).toMatchObject({ id: orderId })
  })

  it('met à jour le suivi auprès du fournisseur et prévient le client de l’expédition', async () => {
    const { orderId, reference } = await placeOrder(env)
    await env.service.handlePaymentEvent({ reference, outcome: 'paid' })
    const seen = await env.service.lookup(orderId, customer.email)
    expect(seen).toMatchObject({ status: 'shipped', tracking: { carrier: 'Colissimo', trackingNumber: 'XY123' } })
    expect(seen?.steps.confirmed).toBeDefined()
    expect(seen?.steps.shipped).toBeDefined()
    expect(env.notifier.orderShipped).toHaveBeenCalledTimes(1)
  })
})

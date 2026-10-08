import { describe, expect, it } from 'vitest'
import { createOrderService } from '../orders/service'
import { MemoryOrderStore } from '../orders/store'
import type { Order } from '../orders/types'
import { DemoPaymentProvider } from '../payment/demo'
import { CJ_ERRORS, CjClient } from './cj-client'
import { CjFulfillmentProvider, missingCjConfig, missingCjMapping, readCjSettings, toCjOrder, type CjMapping } from './cj'

const mapping: CjMapping = {
  variantIds: { '12x12': 'VID-12', '15x15': 'VID-15', '20x20': 'VID-20', '30x20': 'VID-30' },
  logisticNames: { standard: 'CJPacket Ordinary' },
}

const settings = readCjSettings({ CJ_API_KEY: 'CJ1@api@x', CJ_IOSS_TYPE: '3' })

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 'LK-ABC234',
    accessKey: 'cle',
    createdAt: '2026-10-07T10:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
    status: 'paid',
    customer: { email: 'camille@exemple.fr', phone: '06 12 34 56 78', firstName: 'Camille', lastName: 'Martin' },
    shippingAddress: { address1: '12 rue des Lilas', address2: '', postalCode: '75011', city: 'Paris', region: '', country: 'FR' },
    shippingMethodId: 'standard',
    shippingMethodLabel: 'Livraison standard à domicile',
    lines: [
      { variantId: '20x20', label: '20 × 20 cm', quantity: 2, unitPriceCents: 2000, totalCents: 4000 },
      { variantId: '12x12', label: '12 × 12 cm', quantity: 1, unitPriceCents: 1000, totalCents: 1000 },
    ],
    subtotalCents: 5000,
    shippingCents: 500,
    totalCents: 5500,
    currency: 'EUR',
    payment: { provider: 'demo', reference: 'ref', paidAt: '2026-10-07T10:01:00.000Z' },
    fulfillment: { provider: 'cj', supplierOrderId: null, carrier: null, trackingNumber: null, trackingUrl: null, lastSyncAt: null, error: null },
    history: [],
    ...overrides,
  }
}

/** Faux CJ : jeton, puis réponses données par `routes` selon l'adresse appelée. */
function provider(routes: Record<string, (body: unknown) => unknown>, overrides: Partial<typeof settings> = {}) {
  const calls: { endpoint: string; body: unknown }[] = []
  const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input))
    const endpoint = url.pathname.replace('/api2.0/v1', '')
    const body = init?.body ? JSON.parse(String(init.body)) : Object.fromEntries(url.searchParams)
    calls.push({ endpoint, body })
    const reply =
      endpoint === '/authentication/getAccessToken'
        ? { code: 200, result: true, data: { accessToken: 't', accessTokenExpiryDate: '2099-01-01T00:00:00Z', refreshToken: 'r', refreshTokenExpiryDate: '2099-01-01T00:00:00Z', openId: 1 } }
        : (routes[endpoint]?.(body) ?? { code: 404, result: false, message: `inattendu : ${endpoint}` })
    return new Response(JSON.stringify(reply))
  }) as typeof globalThis.fetch
  const client = new CjClient({ apiKey: 'k', tokenFile: null, minIntervalMs: 0, fetch })
  return { cj: new CjFulfillmentProvider({ ...settings, ...overrides }, client, mapping), calls }
}

const ok = (data: unknown) => ({ code: 200, result: true, message: 'Success', data })
const fail = (code: number, message: string) => ({ code, result: false, message, data: null })

describe('toCjOrder', () => {
  it('traduit la commande dans le format de createOrderV2', () => {
    expect(toCjOrder(order(), settings, mapping)).toEqual({
      orderNumber: 'LK-ABC234',
      shippingCountryCode: 'FR',
      shippingCountry: 'France',
      shippingProvince: 'Paris',
      shippingCity: 'Paris',
      shippingZip: '75011',
      shippingAddress: '12 rue des Lilas',
      shippingCustomerName: 'Camille Martin',
      shippingPhone: '0612345678',
      email: 'camille@exemple.fr',
      logisticName: 'CJPacket Ordinary',
      fromCountryCode: 'CN',
      payType: 2,
      iossType: 3,
      products: [
        { vid: 'VID-20', quantity: 2 },
        { vid: 'VID-12', quantity: 1 },
      ],
    })
  })

  it('nomme le pays en anglais et transmet les options de test et d’IOSS', () => {
    const payload = toCjOrder(
      order({ shippingAddress: { address1: 'Rue Neuve 1', address2: 'Boîte 3', postalCode: '1000', city: 'Bruxelles', region: 'Bruxelles-Capitale', country: 'BE' } }),
      { ...settings, sandbox: true, iossType: 2, iossNumber: 'IM2500000000', fromCountryCode: 'FR' },
      mapping,
    )
    expect(payload).toMatchObject({
      shippingCountry: 'Belgium',
      shippingProvince: 'Bruxelles-Capitale',
      shippingAddress2: 'Boîte 3',
      fromCountryCode: 'FR',
      isSandbox: 1,
      iossType: 2,
      iossNumber: 'IM2500000000',
    })
  })

  it('refuse d’envoyer une commande sans correspondance CJ', () => {
    expect(() => toCjOrder(order(), settings, { ...mapping, variantIds: {} })).toThrow(/Variante CJ/)
    expect(missingCjMapping({ variantIds: {}, logisticNames: {} })).toHaveLength(5)
    expect(missingCjMapping(mapping)).toEqual([])
  })
})

describe('CjFulfillmentProvider', () => {
  it('crée la commande et renvoie son numéro CJ', async () => {
    const { cj, calls } = provider({
      '/shopping/order/createOrderV2': () => ok({ orderId: 'CJ-1', orderStatus: 'UNSHIPPED' }),
    })
    expect(await cj.createOrder(order())).toEqual({ supplierOrderId: 'CJ-1' })
    expect(calls.find((call) => call.endpoint === '/shopping/order/createOrderV2')?.body).toMatchObject({ orderNumber: 'LK-ABC234', payType: 2 })
  })

  it('signale une commande créée mais restée impayée', async () => {
    const { cj } = provider({ '/shopping/order/createOrderV2': () => ok({ orderId: 'CJ-1', orderStatus: 'UNPAID' }) })
    await expect(cj.createOrder(order())).rejects.toThrow(/non payée/)
  })

  it('accepte une commande impayée quand le paiement CJ est manuel (payType 3)', async () => {
    const { cj } = provider({ '/shopping/order/createOrderV2': () => ok({ orderId: 'CJ-1', orderStatus: 'UNPAID' }) }, { payType: 3 })
    expect(await cj.createOrder(order())).toEqual({ supplierOrderId: 'CJ-1' })
  })

  it('à la relance, reprend la commande déjà créée et la paie', async () => {
    const { cj, calls } = provider({
      '/shopping/order/createOrderV2': () => fail(CJ_ERRORS.duplicateOrder, 'Order exist, please do not duplicate create'),
      '/shopping/order/getOrderDetail': () => ok({ orderId: 'CJ-1', orderStatus: 'UNPAID' }),
      '/shopping/balance/payBalance': () => ok(true),
    })
    expect(await cj.createOrder(order())).toEqual({ supplierOrderId: 'CJ-1' })
    expect(calls.find((call) => call.endpoint === '/shopping/order/getOrderDetail')?.body).toEqual({ orderId: 'LK-ABC234' })
    expect(calls.find((call) => call.endpoint === '/shopping/balance/payBalance')?.body).toEqual({ orderId: 'CJ-1' })
  })

  it('traduit les refus de CJ en consignes', async () => {
    const { cj } = provider({ '/shopping/order/createOrderV2': () => fail(CJ_ERRORS.insufficientBalance, 'Balance is insufficient') })
    await expect(cj.createOrder(order())).rejects.toThrow('Solde CJ insuffisant')
  })

  it('explique le refus d’une commande sans réglage IOSS', async () => {
    // Réponse réelle de CJ pour la France sans CJ_IOSS_TYPE.
    const { cj } = provider({
      '/shopping/order/createOrderV2': () =>
        fail(1603000, '100104:Order create fail: 7001:Please enter a IOSS number.; Ioss Option: Please enter a IOSS number.'),
    })
    await expect(cj.createOrder(order())).rejects.toThrow(/CJ_IOSS_TYPE/)
  })

  it('lit le suivi : expédiée, livrée, annulée', async () => {
    let status = 'SHIPPED'
    const { cj } = provider({
      '/shopping/order/getOrderDetail': () =>
        ok({ orderId: 'CJ-1', orderStatus: status, trackNumber: 'YT123', trackingProvider: 'YunExpress', trackingUrl: null, logisticName: 'CJPacket Ordinary' }),
    })
    const sent = order({ fulfillment: { ...order().fulfillment, supplierOrderId: 'CJ-1' } })
    expect(await cj.getTracking(sent)).toEqual({ status: 'shipped', carrier: 'YunExpress', trackingNumber: 'YT123', trackingUrl: null })
    status = 'DELIVERED'
    expect((await cj.getTracking(sent))?.status).toBe('delivered')
    status = 'CANCELLED'
    expect((await cj.getTracking(sent))?.status).toBe('cancelled')
    status = 'UNSHIPPED'
    expect((await cj.getTracking(sent))?.status).toBe('processing')
    expect(await cj.getTracking(order())).toBeNull()
  })

  it('n’est prêt qu’avec une clé API et toutes les correspondances', () => {
    expect(CjFulfillmentProvider.fromEnv('', {}).isConfigured()).toBe(false)
    expect(new CjFulfillmentProvider(settings, new CjClient({ apiKey: 'k', tokenFile: null }), mapping).isConfigured()).toBe(true)
    expect(new CjFulfillmentProvider(settings, new CjClient({ apiKey: 'k', tokenFile: null }), { ...mapping, logisticNames: {} }).isConfigured()).toBe(false)
  })

  it('reste fermé tant que l’IOSS n’est pas réglé pour une livraison dans l’UE', () => {
    const client = new CjClient({ apiKey: 'k', tokenFile: null })
    expect(new CjFulfillmentProvider({ ...settings, iossType: null }, client, mapping).isConfigured()).toBe(false)
    expect(missingCjConfig({ ...settings, iossType: null }, mapping)).toEqual(['CJ_IOSS_TYPE'])
    expect(missingCjConfig({ ...settings, iossType: 2, iossNumber: null }, mapping)).toEqual(['CJ_IOSS_NUMBER'])
    expect(missingCjConfig({ ...settings, apiKey: '' }, mapping)).toEqual(['CJ_API_KEY'])
  })
})

describe('chaîne complète avec CJ', () => {
  it('paiement confirmé → commande CJ payée sur le solde → colis expédié', async () => {
    let cjStatus = 'UNSHIPPED'
    const { cj, calls } = provider({
      '/shopping/order/createOrderV2': () => ok({ orderId: 'CJ-777', orderStatus: 'UNSHIPPED' }),
      '/shopping/order/getOrderDetail': () =>
        ok({ orderId: 'CJ-777', orderStatus: cjStatus, trackNumber: cjStatus === 'SHIPPED' ? 'YT999' : null, trackingProvider: 'YunExpress' }),
    })
    const store = new MemoryOrderStore()
    const payment = new DemoPaymentProvider()
    const shipped: string[] = []
    const service = createOrderService({
      mode: 'demo',
      store,
      payment,
      fulfillment: cj,
      notifier: { orderPaid: async () => {}, orderShipped: async (sent) => void shipped.push(sent.id) },
      trackingSyncMs: 0,
    })

    const { orderId, redirectUrl } = await service.checkout(
      {
        customer: { ...order().customer, ...order().shippingAddress, shippingMethodId: 'standard', acceptTerms: true },
        lines: [{ variantId: '30x20', quantity: 1 }],
      },
      'https://boutique.test',
    )
    expect(calls.some((call) => call.endpoint === '/shopping/order/createOrderV2')).toBe(false)

    await service.handlePaymentEvent({ reference: new URL(redirectUrl).searchParams.get('ref')!, outcome: 'paid' })
    const sent = (await store.get(orderId))!
    expect(sent).toMatchObject({ status: 'sent_to_supplier', fulfillment: { supplierOrderId: 'CJ-777' } })
    expect(calls.find((call) => call.endpoint === '/shopping/order/createOrderV2')?.body).toMatchObject({
      orderNumber: orderId,
      payType: 2,
      products: [{ vid: 'VID-30', quantity: 1 }],
    })

    cjStatus = 'SHIPPED'
    await service.syncAll()
    expect(await store.get(orderId)).toMatchObject({ status: 'shipped', fulfillment: { trackingNumber: 'YT999', carrier: 'YunExpress' } })
    expect(shipped).toEqual([orderId])
  })
})

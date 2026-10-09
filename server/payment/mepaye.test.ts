import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { createDefaultDeps } from '../app'
import { readConfig } from '../config'
import { createOrderService } from '../orders/service'
import { MemoryOrderStore } from '../orders/store'
import type { Order } from '../orders/types'
import type { FulfillmentProvider } from '../fulfillment/types'
import { DemoPaymentProvider } from './demo'
import { MepayePaymentProvider, internationalPhone, readMepayeSettings } from './mepaye'

const LIVE = readMepayeSettings({ MEPAYE_API_KEY: 'mp_live_abc', MEPAYE_WEBHOOK_SECRET: 'whsec' })
const TEST = readMepayeSettings({ MEPAYE_API_KEY: 'mp_test_abc', MEPAYE_WEBHOOK_SECRET: 'whsec' })

function order(): Order {
  return {
    id: 'LK-ABC234',
    accessKey: 'cle',
    createdAt: '2026-10-09T10:00:00.000Z',
    updatedAt: '2026-10-09T10:00:00.000Z',
    status: 'pending_payment',
    customer: { email: 'camille@exemple.fr', phone: '0612345678', firstName: 'Camille', lastName: 'Martin' },
    shippingAddress: { address1: '12 rue des Lilas', address2: '', postalCode: '75011', city: 'Paris', region: '', country: 'FR' },
    shippingMethodId: 'standard',
    shippingMethodLabel: 'Livraison standard à domicile',
    lines: [{ variantId: '20x20', label: '20 × 20 cm', quantity: 1, unitPriceCents: 3290, totalCents: 3290 }],
    subtotalCents: 3290,
    shippingCents: 0,
    totalCents: 3290,
    currency: 'EUR',
    payment: { provider: 'mepaye', reference: null, paidAt: null },
    fulfillment: { provider: 'cj', supplierOrderId: null, carrier: null, trackingNumber: null, trackingUrl: null, lastSyncAt: null, error: null },
    history: [],
  }
}

const URLS = { returnUrl: 'https://boutique.test/commande/confirmation', cancelUrl: 'https://boutique.test/commande', notifyUrl: 'https://boutique.test/api/payments/notify' }

/** Faux Mepaye : enregistre la requête, renvoie `reply` avec le statut HTTP donné. */
function fakeApi(reply: unknown, status = 201) {
  const calls: { url: string; init: RequestInit }[] = []
  const fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} })
    return new Response(JSON.stringify(reply), { status })
  }) as typeof globalThis.fetch
  return { fetch, calls }
}

/** Notification signée comme Mepaye (HMAC-SHA256 du corps brut). */
function webhook(body: unknown, secret = 'whsec') {
  const raw = JSON.stringify(body)
  const signature = `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`
  return new Request('https://boutique.test/api/payments/notify', {
    method: 'POST',
    headers: { 'X-Mepaye-Signature': signature, 'X-Mepaye-Event': String((body as { event?: string }).event) },
    body: raw,
  })
}

const succeeded = (test = false) => ({
  event: 'payment.succeeded',
  data: { id: 'pay_1', externalReference: 'LK-ABC234', status: 'PAID', amount: 3290, currency: 'EUR', test },
})

describe('MepayePaymentProvider', () => {
  it('crée le paiement : montant en centimes, numéro de commande, acheteur, clé d’idempotence', async () => {
    const api = fakeApi({ id: 'pay_1', status: 'pending', test: false, payment_url: 'https://pay.mepaye.com/checkout/pay_1' })
    const mepaye = new MepayePaymentProvider(LIVE, { fetch: api.fetch })
    expect(await mepaye.createPayment({ order: order(), ...URLS })).toEqual({
      reference: 'pay_1',
      redirectUrl: 'https://pay.mepaye.com/checkout/pay_1',
    })
    const [call] = api.calls
    expect(call.url).toBe('https://mepaye.com/api/v1/payments')
    expect(call.init.headers).toMatchObject({ Authorization: 'Bearer mp_live_abc', 'Idempotency-Key': 'LK-ABC234' })
    expect(JSON.parse(String(call.init.body))).toEqual({
      amount: 3290,
      currency: 'EUR',
      externalReference: 'LK-ABC234',
      buyer: { name: 'Camille Martin', email: 'camille@exemple.fr', phone: '+33612345678', country: 'FR' },
    })
  })

  it('traduit les refus de Mepaye en consignes', async () => {
    const api = fakeApi({ error: { code: 'currency_mismatch', message: 'Currency must match the shop currency' } }, 422)
    const mepaye = new MepayePaymentProvider(LIVE, { fetch: api.fetch })
    await expect(mepaye.createPayment({ order: order(), ...URLS })).rejects.toThrow(/devise de la boutique Mepaye/)
  })

  it('n’accepte que les notifications signées avec le secret du webhook', async () => {
    const mepaye = new MepayePaymentProvider(LIVE)
    expect(await mepaye.parseNotification(webhook(succeeded()))).toEqual({
      reference: 'pay_1',
      outcome: 'paid',
      amountCents: 3290,
      currency: 'EUR',
    })
    expect(await mepaye.parseNotification(webhook(succeeded(), 'autre-secret'))).toBeNull()
    const failed = { event: 'payment.failed', data: { id: 'pay_1', test: false } }
    expect(await mepaye.parseNotification(webhook(failed))).toMatchObject({ reference: 'pay_1', outcome: 'failed' })
  })

  it('ignore un paiement de test avec une clé réelle, et inversement', async () => {
    expect(await new MepayePaymentProvider(LIVE).parseNotification(webhook(succeeded(true)))).toBeNull()
    expect(await new MepayePaymentProvider(TEST, { allowTestKey: true }).parseNotification(webhook(succeeded(false)))).toBeNull()
    expect(await new MepayePaymentProvider(TEST, { allowTestKey: true }).parseNotification(webhook(succeeded(true)))).toMatchObject({ outcome: 'paid' })
  })

  it('une clé de test n’ouvre jamais la vente réelle', () => {
    expect(new MepayePaymentProvider(LIVE).isConfigured()).toBe(true)
    expect(new MepayePaymentProvider(TEST).isConfigured()).toBe(false)
    expect(new MepayePaymentProvider(TEST).missing()).toEqual([expect.stringMatching(/clé de test/)])
    expect(new MepayePaymentProvider(TEST, { allowTestKey: true }).isConfigured()).toBe(true)
    expect(new MepayePaymentProvider({ ...LIVE, webhookSecret: '' }).isConfigured()).toBe(false)
  })

  it('met le téléphone au format international quand c’est possible', () => {
    expect(internationalPhone('06 12 34 56 78', 'FR')).toBe('+33612345678')
    expect(internationalPhone('+33 6 12 34 56 78', 'FR')).toBe('+33612345678')
    expect(internationalPhone('12 34', 'FR')).toBeNull()
  })
})

describe('choix du paiement', () => {
  it('en démo, Mepaye seulement avec une clé de test ; en réel, toujours Mepaye', () => {
    const demo = (env: NodeJS.ProcessEnv) => createDefaultDeps(readConfig(env, 'demo'), env).payment
    expect(demo({})).toBeInstanceOf(DemoPaymentProvider)
    expect(demo({ MEPAYE_API_KEY: 'mp_live_abc' })).toBeInstanceOf(DemoPaymentProvider)
    expect(demo({ MEPAYE_API_KEY: 'mp_test_abc', MEPAYE_WEBHOOK_SECRET: 'w' })).toBeInstanceOf(MepayePaymentProvider)
    const live = createDefaultDeps(readConfig({}, 'live'), {}).payment
    expect(live).toBeInstanceOf(MepayePaymentProvider)
  })
})

describe('notification de paiement', () => {
  it('un montant différent de la commande ne la valide pas', async () => {
    const store = new MemoryOrderStore()
    const createOrder = vi.fn(async () => ({ supplierOrderId: 'CJ-1' }))
    const fulfillment: FulfillmentProvider = { id: 'cj', isConfigured: () => true, createOrder, getTracking: async () => null }
    const service = createOrderService({
      mode: 'demo',
      store,
      payment: new DemoPaymentProvider(),
      fulfillment,
      notifier: { orderPaid: async () => {}, orderShipped: async () => {} },
    })
    await store.create({ ...order(), payment: { provider: 'mepaye', reference: 'pay_1', paidAt: null } })

    await service.handlePaymentEvent({ reference: 'pay_1', outcome: 'paid', amountCents: 100, currency: 'EUR' })
    expect((await store.get('LK-ABC234'))?.status).toBe('pending_payment')
    await service.handlePaymentEvent({ reference: 'pay_1', outcome: 'paid', amountCents: 3290, currency: 'XOF' })
    expect((await store.get('LK-ABC234'))?.status).toBe('pending_payment')

    await service.handlePaymentEvent({ reference: 'pay_1', outcome: 'paid', amountCents: 3290, currency: 'EUR' })
    expect((await store.get('LK-ABC234'))?.status).toBe('sent_to_supplier')
    expect(createOrder).toHaveBeenCalledTimes(1)
  })
})

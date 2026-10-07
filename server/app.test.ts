import { describe, expect, it } from 'vitest'
import { createApp, type AppDeps } from './app'
import { CjFulfillmentProvider } from './fulfillment/cj'
import { DemoFulfillmentProvider } from './fulfillment/demo'
import { consoleNotifier } from './notify'
import { MemoryOrderStore } from './orders/store'
import { AggregatorPaymentProvider } from './payment/aggregator'
import { DemoPaymentProvider } from './payment/demo'

const silentNotifier = { orderPaid: async () => {}, orderShipped: async () => {} } satisfies typeof consoleNotifier

function demoApp(overrides: Partial<AppDeps['config']> = {}) {
  return createApp({
    config: { mode: 'demo', publicUrl: 'https://boutique.test', dataDir: '', adminToken: 'secret', ...overrides },
    store: new MemoryOrderStore(),
    payment: new DemoPaymentProvider(),
    fulfillment: new DemoFulfillmentProvider(),
    notifier: silentNotifier,
  })
}

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

// Corps JSON d'une réponse, lu sans contrôle de type (c'est l'objet des assertions).
// oxlint-disable-next-line typescript/no-explicit-any
const read = async (response: Response) => (await response.json()) as Record<string, any>

const json = (body: unknown) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

describe('API en mode démo', () => {
  it('GET /api/shop : vente ouverte avec des prix fictifs', async () => {
    const response = await demoApp().request('/api/shop')
    const shop = await read(response)
    expect(shop).toMatchObject({ mode: 'demo', saleOpen: true, currency: 'EUR' })
    expect(shop.variants.every((variant: { priceCents: number | null }) => variant.priceCents !== null)).toBe(true)
  })

  it('parcours complet : commande, paiement simulé, confirmation, suivi', async () => {
    const app = demoApp()
    const checkout = await app.request('/api/checkout', json({ customer, lines: [{ variantId: '12x12', quantity: 1 }] }))
    expect(checkout.status).toBe(201)
    const { orderId, redirectUrl } = await read(checkout)
    expect(redirectUrl).toMatch(/^https:\/\/boutique\.test\/paiement-demo\?ref=/)

    const reference = new URL(redirectUrl).searchParams.get('ref')
    const demo = await read(await app.request(`/api/demo/payments/${reference}`))
    expect(demo).toEqual({ orderId, amountCents: 1500, currency: 'EUR' })

    const paid = await app.request(`/api/demo/payments/${reference}`, json({ outcome: 'paid' }))
    const { redirectUrl: back } = await read(paid)
    const returnUrl = new URL(back)
    expect(returnUrl.pathname).toBe('/commande/confirmation')

    const confirmation = await app.request(`/api/orders/${orderId}?cle=${returnUrl.searchParams.get('cle')}`)
    expect(await read(confirmation)).toMatchObject({ id: orderId, status: 'preparing', totalCents: 1500 })

    const lookup = await app.request('/api/orders/lookup', json({ orderId, email: customer.email }))
    expect(lookup.status).toBe(200)
  })

  it('POST /api/checkout : 400 avec le détail des champs', async () => {
    const response = await demoApp().request('/api/checkout', json({ customer: {}, lines: [] }))
    expect(response.status).toBe(400)
    const body = await read(response)
    expect(body.errors).toHaveProperty('email')
    expect(body.errors).toHaveProperty('lines')
  })

  it('une commande ne se lit pas sans sa clé', async () => {
    const app = demoApp()
    const { orderId } = await read(await app.request('/api/checkout', json({ customer, lines: [{ variantId: '12x12', quantity: 1 }] })))
    expect((await app.request(`/api/orders/${orderId}?cle=devinette`)).status).toBe(404)
    expect((await app.request('/api/orders/lookup', json({ orderId, email: 'autre@exemple.fr' }))).status).toBe(404)
  })

  it('l’administration demande le jeton', async () => {
    const app = demoApp()
    expect((await app.request('/api/admin/orders')).status).toBe(404)
    const ok = await app.request('/api/admin/orders', { headers: { Authorization: 'Bearer secret' } })
    expect(ok.status).toBe(200)
  })
})

describe('API en mode réel, avant raccordement', () => {
  const app = createApp({
    config: { mode: 'live', publicUrl: null, dataDir: '', adminToken: null },
    store: new MemoryOrderStore(),
    payment: new AggregatorPaymentProvider(),
    fulfillment: new CjFulfillmentProvider(),
    notifier: silentNotifier,
  })

  it('la vente reste fermée et aucune commande n’est acceptée', async () => {
    const shop = await read(await app.request('/api/shop'))
    expect(shop.saleOpen).toBe(false)
    expect(shop.closedReason).toBeTruthy()
    // Jamais de prix fictif en mode réel.
    expect(shop.variants.every((variant: { priceCents: number | null }) => variant.priceCents === null)).toBe(true)

    const checkout = await app.request('/api/checkout', json({ customer, lines: [{ variantId: '12x12', quantity: 1 }] }))
    expect(checkout.status).toBe(503)
  })

  it('la page de paiement simulée n’existe pas', async () => {
    expect((await app.request('/api/demo/payments/demo_x')).status).toBe(404)
  })

  it('une notification de paiement non vérifiée est refusée', async () => {
    const response = await app.request('/api/payments/notify', json({ reference: 'x', status: 'paid' }))
    expect(response.status).toBe(400)
  })
})

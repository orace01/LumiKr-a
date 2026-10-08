import { describe, expect, it, vi } from 'vitest'
import { createDefaultDeps, createApp } from '../app'
import { readConfig } from '../config'
import { CjClient } from '../fulfillment/cj-client'
import type { FulfillmentProvider } from '../fulfillment/types'
import { DemoPaymentProvider } from '../payment/demo'
import { RedisOrderStore, RedisRest, readRedisSettings, redisTokenStore } from './redis'
import { createOrderService } from './service'
import type { Order } from './types'

/** Faux Upstash : les commandes Redis employées par la boutique, sur une Map partagée. */
function fakeUpstash(hooks: { beforeEval?: () => void } = {}) {
  const data = new Map<string, string>()
  const sets = new Map<string, Set<string>>()
  const run = ([command, ...args]: string[]): unknown => {
    switch (command) {
      case 'GET':
        return data.get(args[0]) ?? null
      case 'SET':
        if (args[2] === 'NX' && data.has(args[0])) return null
        data.set(args[0], args[1])
        return 'OK'
      case 'SADD': {
        const set = sets.get(args[0]) ?? new Set()
        sets.set(args[0], set)
        args.slice(1).forEach((member) => set.add(member))
        return 1
      }
      case 'SMEMBERS':
        return [...(sets.get(args[0]) ?? [])]
      case 'MGET':
        return args.map((key) => data.get(key) ?? null)
      case 'EVAL': {
        hooks.beforeEval?.()
        const [, , key, expected, next] = args
        if (data.get(key) !== expected) return 0
        data.set(key, next)
        return 1
      }
      default:
        throw new Error(`commande inattendue : ${command}`)
    }
  }
  const fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    // Chaque appel rend la main, comme une vraie requête réseau.
    await new Promise((resolve) => setTimeout(resolve, 1))
    return new Response(JSON.stringify({ result: run(JSON.parse(String(init?.body))) }))
  }) as typeof globalThis.fetch
  const redis = () => new RedisRest({ url: 'https://redis.test', token: 't' }, fetch)
  return { data, redis }
}

function order(id: string): Order {
  return {
    id,
    accessKey: 'cle',
    createdAt: '2026-10-08T10:00:00.000Z',
    updatedAt: '2026-10-08T10:00:00.000Z',
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
    payment: { provider: 'demo', reference: null, paidAt: null },
    fulfillment: { provider: 'cj', supplierOrderId: null, carrier: null, trackingNumber: null, trackingUrl: null, lastSyncAt: null, error: null },
    history: [],
  }
}

describe('RedisOrderStore', () => {
  it('enregistre, retrouve par référence de paiement et liste les commandes', async () => {
    const { redis } = fakeUpstash()
    const store = new RedisOrderStore(redis())
    await store.create(order('LK-AAAAAA'))
    await store.create(order('LK-BBBBBB'))
    await expect(store.create(order('LK-AAAAAA'))).rejects.toThrow(/déjà/)

    await store.update('LK-BBBBBB', (current) => ({ ...current, payment: { ...current.payment, reference: 'ref-b' } }))
    expect((await store.findByPaymentReference('ref-b'))?.id).toBe('LK-BBBBBB')
    expect(await store.findByPaymentReference('inconnue')).toBeNull()
    expect((await store.list()).map((saved) => saved.id)).toEqual(['LK-AAAAAA', 'LK-BBBBBB'])
  })

  it('recommence une mise à jour modifiée entre-temps par une autre instance', async () => {
    let interfere = true
    const fake = fakeUpstash({
      beforeEval: () => {
        if (!interfere) return
        interfere = false
        // Une autre instance enregistre sa modification juste avant nous.
        const key = 'lumikrea:order:LK-AAAAAA'
        const saved = JSON.parse(fake.data.get(key)!) as Order
        fake.data.set(key, JSON.stringify({ ...saved, fulfillment: { ...saved.fulfillment, carrier: 'YunExpress' } }))
      },
    })
    const store = new RedisOrderStore(fake.redis())
    await store.create(order('LK-AAAAAA'))
    const change = vi.fn((current: Order) => ({ ...current, status: 'paid' as const }))
    const updated = await store.update('LK-AAAAAA', change)
    expect(change).toHaveBeenCalledTimes(2)
    expect(updated).toMatchObject({ status: 'paid', fulfillment: { carrier: 'YunExpress' } })
  })

  it('deux instances notifiées du même paiement ne transmettent la commande qu’une fois', async () => {
    const { redis } = fakeUpstash()
    const createOrder = vi.fn(async (paid: Order) => ({ supplierOrderId: `CJ-${paid.id}` }))
    const fulfillment: FulfillmentProvider = { id: 'cj', isConfigured: () => true, createOrder, getTracking: async () => null }
    const payment = new DemoPaymentProvider()
    const instance = () =>
      createOrderService({
        mode: 'demo',
        store: new RedisOrderStore(redis()),
        payment,
        fulfillment,
        notifier: { orderPaid: async () => {}, orderShipped: async () => {} },
        trackingSyncMs: 0,
      })
    const [first, second] = [instance(), instance()]
    const { orderId, redirectUrl } = await first.checkout(
      {
        customer: { ...order('x').customer, ...order('x').shippingAddress, shippingMethodId: 'standard', acceptTerms: true },
        lines: [{ variantId: '20x20', quantity: 1 }],
      },
      'https://boutique.test',
    )
    const reference = new URL(redirectUrl).searchParams.get('ref')!
    await Promise.all([
      first.handlePaymentEvent({ reference, outcome: 'paid' }),
      second.handlePaymentEvent({ reference, outcome: 'paid' }),
    ])
    expect(createOrder).toHaveBeenCalledTimes(1)
    expect((await second.lookup(orderId, 'camille@exemple.fr'))?.status).toBe('preparing')
  })
})

describe('jeton CJ dans Redis', () => {
  it('est partagé entre instances : une seule authentification', async () => {
    const { redis } = fakeUpstash()
    const calls: string[] = []
    const cjFetch = (async (input: string | URL | Request) => {
      const endpoint = new URL(String(input)).pathname.replace('/api2.0/v1', '')
      calls.push(endpoint)
      const data = endpoint.startsWith('/authentication')
        ? { accessToken: 'a', accessTokenExpiryDate: '2099-01-01T00:00:00Z', refreshToken: 'r', refreshTokenExpiryDate: '2099-01-01T00:00:00Z' }
        : 'ok'
      return new Response(JSON.stringify({ code: 200, result: true, data }))
    }) as typeof globalThis.fetch
    const client = () => new CjClient({ apiKey: 'k', tokenStore: redisTokenStore(redis()), minIntervalMs: 0, fetch: cjFetch })
    await client().call('GET', '/x')
    await client().call('GET', '/y')
    expect(calls).toEqual(['/authentication/getAccessToken', '/x', '/y'])
  })
})

describe('choix du stockage', () => {
  it('lit les identifiants fournis par Vercel ou par Upstash', () => {
    expect(readRedisSettings({ KV_REST_API_URL: 'https://a.upstash.io/', KV_REST_API_TOKEN: 't' })).toEqual({ url: 'https://a.upstash.io', token: 't' })
    expect(readRedisSettings({ UPSTASH_REDIS_REST_URL: 'https://b.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'u' })).toEqual({ url: 'https://b.upstash.io', token: 'u' })
    expect(readRedisSettings({})).toBeNull()
  })

  it('garde la vente fermée sur Vercel sans base de données', async () => {
    const env = { VERCEL: '1' }
    const deps = createDefaultDeps(readConfig(env, 'demo'), env)
    expect(deps.storageReady).toBe(false)
    const shop = await (await createApp(deps).request('/api/shop')).json()
    expect(shop).toMatchObject({ saleOpen: false, closedReason: expect.stringMatching(/enregistrement des commandes/) })
  })

  it('emploie Redis dès qu’il est configuré', () => {
    const env = { VERCEL: '1', KV_REST_API_URL: 'https://a.upstash.io', KV_REST_API_TOKEN: 't' }
    const deps = createDefaultDeps(readConfig(env, 'live'), env)
    expect(deps.store).toBeInstanceOf(RedisOrderStore)
    expect(deps.storageReady).toBe(true)
  })
})

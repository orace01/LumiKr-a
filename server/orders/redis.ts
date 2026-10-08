import type { CjToken, CjTokenStore } from '../fulfillment/cj-client'
import type { OrderStore } from './store'
import type { Order } from './types'

// Base Redis « Upstash » par son API REST, sans paquet à installer : c'est la
// base que Vercel propose (Storage → Upstash for Redis). Indispensable sur un
// hébergement « serverless » comme Vercel, où les fichiers ne sont pas gardés
// d'une requête à l'autre.

export interface RedisSettings {
  url: string
  token: string
}

/** Identifiants fournis par Vercel (KV_REST_API_*) ou par Upstash directement (UPSTASH_REDIS_REST_*). */
export function readRedisSettings(env: NodeJS.ProcessEnv = process.env): RedisSettings | null {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null
}

export class RedisRest {
  private readonly settings: RedisSettings
  private readonly fetch: typeof fetch

  constructor(settings: RedisSettings, fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis)) {
    this.settings = settings
    this.fetch = fetchImpl
  }

  /** Une commande Redis, par exemple `command('GET', 'clé')`. */
  async command<T>(...args: string[]): Promise<T> {
    const response = await this.fetch(this.settings.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.settings.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(10_000),
    })
    const payload = (await response.json().catch(() => null)) as { result?: T; error?: string } | null
    if (!response.ok || !payload || payload.error !== undefined) {
      throw new Error(`Redis : ${payload?.error ?? `réponse HTTP ${response.status}`}`)
    }
    return payload.result as T
  }
}

// Remplace la valeur seulement si elle n'a pas changé depuis sa lecture : deux
// instances du serveur ne peuvent pas s'écraser l'une l'autre.
const COMPARE_AND_SET = `if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('SET', KEYS[1], ARGV[2]) return 1 end return 0`

/** Une commande par clé, plus l'index des références de paiement et la liste des numéros. */
export class RedisOrderStore implements OrderStore {
  private readonly redis: RedisRest
  private readonly prefix: string

  constructor(redis: RedisRest, prefix = 'lumikrea') {
    this.redis = redis
    this.prefix = prefix
  }

  private orderKey(id: string) {
    return `${this.prefix}:order:${id}`
  }

  private paymentKey(reference: string) {
    return `${this.prefix}:payment:${reference}`
  }

  private get listKey() {
    return `${this.prefix}:orders`
  }

  async get(id: string) {
    const raw = await this.redis.command<string | null>('GET', this.orderKey(id))
    return raw ? (JSON.parse(raw) as Order) : null
  }

  async findByPaymentReference(reference: string) {
    const id = await this.redis.command<string | null>('GET', this.paymentKey(reference))
    return id ? this.get(id) : null
  }

  async list() {
    const ids = await this.redis.command<string[]>('SMEMBERS', this.listKey)
    if (ids.length === 0) return []
    const raws = await this.redis.command<(string | null)[]>('MGET', ...ids.map((id) => this.orderKey(id)))
    return raws
      .flatMap((raw) => (raw ? [JSON.parse(raw) as Order] : []))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  async create(order: Order) {
    const created = await this.redis.command<string | null>('SET', this.orderKey(order.id), JSON.stringify(order), 'NX')
    if (created !== 'OK') throw new Error(`Commande ${order.id} déjà enregistrée.`)
    await this.redis.command('SADD', this.listKey, order.id)
    await this.indexPayment(order)
  }

  async update(id: string, change: (order: Order) => Order) {
    for (let attempt = 0; attempt < 10; attempt++) {
      const raw = await this.redis.command<string | null>('GET', this.orderKey(id))
      if (!raw) throw new Error(`Commande ${id} introuvable.`)
      const next = change(JSON.parse(raw) as Order)
      const serialized = JSON.stringify(next)
      if (serialized === raw) return next
      const saved = await this.redis.command<number>('EVAL', COMPARE_AND_SET, '1', this.orderKey(id), raw, serialized)
      if (saved === 1) {
        await this.indexPayment(next)
        return next
      }
      // Modifiée entre-temps par une autre instance : on recommence sur la version à jour.
    }
    throw new Error(`Commande ${id} : trop de modifications simultanées.`)
  }

  private async indexPayment(order: Order) {
    if (order.payment.reference) await this.redis.command('SET', this.paymentKey(order.payment.reference), order.id)
  }
}

/** Jeton CJ partagé par toutes les instances du serveur. */
export function redisTokenStore(redis: RedisRest, key = 'lumikrea:cj-token'): CjTokenStore {
  return {
    async load() {
      const raw = await redis.command<string | null>('GET', key)
      return raw ? (JSON.parse(raw) as CjToken) : null
    },
    async save(token) {
      await redis.command('SET', key, JSON.stringify(token))
    },
  }
}

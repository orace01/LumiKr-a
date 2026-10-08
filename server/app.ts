import { getConnInfo } from '@hono/node-server/conninfo'
import { Hono, type Context } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { secureHeaders } from 'hono/secure-headers'
import { missingLegalInfo } from '../src/content/legal/fields'
import type { ShopMode } from '../src/shop/types'
import { readConfig, type ServerConfig } from './config'
import { CjFulfillmentProvider, readCjSettings } from './fulfillment/cj'
import { DemoFulfillmentProvider } from './fulfillment/demo'
import type { FulfillmentProvider } from './fulfillment/types'
import { consoleNotifier, type Notifier } from './notify'
import { CheckoutError, createOrderService } from './orders/service'
import { JsonFileOrderStore, type OrderStore } from './orders/store'
import { AggregatorPaymentProvider } from './payment/aggregator'
import { DemoPaymentProvider } from './payment/demo'
import type { PaymentProvider } from './payment/types'
import { createRateLimiter } from './rate-limit'

export interface AppDeps {
  config: ServerConfig
  store: OrderStore
  payment: PaymentProvider
  fulfillment: FulfillmentProvider
  notifier: Notifier
  /** Si renseigné, suit les commandes en cours auprès du fournisseur à cet intervalle. */
  syncIntervalMs?: number
}

/** L'API de la boutique, sous /api. Les dépendances sont injectées pour les tests. */
export function createApp(deps: AppDeps) {
  const { config, payment } = deps
  const orders = createOrderService({ mode: config.mode, ...deps })
  if (deps.syncIntervalMs) {
    const timer = setInterval(() => {
      orders.syncAll().catch((error) => console.error('[fournisseur] suivi périodique impossible', error))
    }, deps.syncIntervalMs)
    timer.unref()
  }
  const limitCheckout = createRateLimiter({ max: 10, windowMs: 60_000 })
  const limitLookup = createRateLimiter({ max: 30, windowMs: 60_000 })

  const app = new Hono().basePath('/api')
  app.use(secureHeaders())
  app.use(bodyLimit({ maxSize: 64 * 1024, onError: (c) => c.json({ message: 'Requête trop volumineuse.' }, 413) }))

  // Origine publique du site, pour les liens de retour du paiement.
  const originOf = (c: Context) => config.publicUrl ?? new URL(c.req.url).origin
  const clientIp = (c: Context) => {
    const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
    if (forwarded) return forwarded
    try {
      return getConnInfo(c).remote.address ?? 'inconnu'
    } catch {
      return 'inconnu'
    }
  }
  const tooMany = (c: Context) => c.json({ message: 'Trop de tentatives. Réessayez dans une minute.' }, 429)

  app.get('/shop', (c) => {
    c.header('Cache-Control', 'no-store')
    return c.json(orders.catalog())
  })

  app.post('/checkout', async (c) => {
    if (!limitCheckout(clientIp(c))) return tooMany(c)
    const body = await c.req.json().catch(() => null)
    try {
      return c.json(await orders.checkout(body, originOf(c)), 201)
    } catch (error) {
      if (error instanceof CheckoutError) {
        return c.json({ message: error.message, errors: error.errors ?? {} }, error.status as 400 | 502 | 503)
      }
      throw error
    }
  })

  // Notification (webhook) du prestataire de paiement.
  app.post('/payments/notify', async (c) => {
    const event = await payment.parseNotification(c.req.raw)
    if (!event) return c.json({ message: 'Notification invalide.' }, 400)
    const order = await orders.handlePaymentEvent(event)
    if (!order) console.warn(`[paiement] notification pour une référence inconnue : ${event.reference}`)
    return c.json({ received: true })
  })

  app.get('/orders/:id', async (c) => {
    if (!limitLookup(clientIp(c))) return tooMany(c)
    const order = await orders.getForCustomer(c.req.param('id'), c.req.query('cle') ?? '')
    c.header('Cache-Control', 'no-store')
    return order ? c.json(order) : c.json({ message: 'Commande introuvable.' }, 404)
  })

  app.post('/orders/lookup', async (c) => {
    if (!limitLookup(clientIp(c))) return tooMany(c)
    const body = (await c.req.json().catch(() => null)) as { orderId?: unknown; email?: unknown } | null
    const id = typeof body?.orderId === 'string' ? body.orderId : ''
    const email = typeof body?.email === 'string' ? body.email : ''
    const order = id && email ? await orders.lookup(id, email) : null
    c.header('Cache-Control', 'no-store')
    return order
      ? c.json(order)
      : c.json({ message: 'Aucune commande ne correspond à ce numéro et à cette adresse e-mail.' }, 404)
  })

  // Page de paiement simulée : n'existe qu'en mode démo.
  if (payment instanceof DemoPaymentProvider) {
    app.get('/demo/payments/:ref', (c) => {
      const session = payment.getSession(c.req.param('ref'))
      if (!session) return c.json({ message: 'Paiement de démonstration introuvable.' }, 404)
      return c.json({ orderId: session.orderId, amountCents: session.amountCents, currency: session.currency })
    })

    app.post('/demo/payments/:ref', async (c) => {
      const session = payment.getSession(c.req.param('ref'))
      if (!session) return c.json({ message: 'Paiement de démonstration introuvable.' }, 404)
      const body = (await c.req.json().catch(() => null)) as { outcome?: unknown } | null
      const outcome = body?.outcome
      if (outcome !== 'paid' && outcome !== 'failed' && outcome !== 'cancelled') {
        return c.json({ message: 'Issue de paiement inconnue.' }, 400)
      }
      await orders.handlePaymentEvent({ reference: session.reference, outcome })
      return c.json({ redirectUrl: outcome === 'cancelled' ? session.cancelUrl : session.returnUrl })
    })
  }

  // Administration minimale, protégée par ADMIN_TOKEN (désactivée sans lui).
  const isAdmin = (c: Context) => {
    const token = c.req.header('authorization')?.replace(/^Bearer\s+/i, '')
    return Boolean(config.adminToken && token && token === config.adminToken)
  }

  app.get('/admin/orders', async (c) => {
    if (!isAdmin(c)) return c.json({ message: 'Introuvable.' }, 404)
    const list = await orders.listOrders()
    return c.json(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  })

  app.post('/admin/orders/:id/fulfill', async (c) => {
    if (!isAdmin(c)) return c.json({ message: 'Introuvable.' }, 404)
    const order = await orders.retryFulfillment(c.req.param('id'))
    return order ? c.json(order) : c.json({ message: 'Commande introuvable.' }, 404)
  })

  app.notFound((c) => c.json({ message: 'Introuvable.' }, 404))
  app.onError((error, c) => {
    console.error('[api]', error)
    return c.json({ message: 'Erreur du serveur. Réessayez dans quelques instants.' }, 500)
  })

  return app
}

/**
 * Dépendances réelles, selon le mode : simulées en démo, raccordées en réel.
 * En démo, CJ n'est sollicité qu'en mode test CJ (CJ_SANDBOX=1, avec une clé) :
 * un paiement simulé ne doit jamais déclencher une vraie commande.
 */
export function createDefaultDeps(config: ServerConfig = readConfig(), env: NodeJS.ProcessEnv = process.env): AppDeps {
  const demo = config.mode === 'demo'
  const cj = readCjSettings(env)
  const useCj = !demo || (cj.sandbox && cj.apiKey !== '')
  return {
    config,
    store: new JsonFileOrderStore(config.dataDir),
    payment: demo ? new DemoPaymentProvider() : new AggregatorPaymentProvider(),
    fulfillment: useCj ? CjFulfillmentProvider.fromEnv(config.dataDir, env) : new DemoFulfillmentProvider(),
    notifier: consoleNotifier,
  }
}

let defaultApp: ReturnType<typeof createApp> | null = null

/**
 * Instance unique utilisée par le serveur de développement (mode `demo` par
 * défaut) et par server/main.ts (mode `live` par défaut). SHOP_MODE l'emporte.
 */
export function getDefaultApp(fallbackMode: ShopMode = 'demo') {
  if (!defaultApp) {
    const deps = createDefaultDeps(readConfig(process.env, fallbackMode))
    console.info(
      `[boutique] mode ${deps.config.mode} · paiement ${deps.payment.id} · fournisseur ${deps.fulfillment.id} · commandes dans ${deps.config.dataDir}/`,
    )
    const legal = missingLegalInfo()
    if (legal.length > 0) console.warn(`[boutique] Pages légales à compléter (src/config/site.ts, shop.ts) : ${legal.join(', ')}`)
    if (deps.fulfillment instanceof CjFulfillmentProvider && !deps.fulfillment.isConfigured()) {
      console.warn(`[boutique] CJ pas encore prêt, il manque : ${deps.fulfillment.missing().join(', ')}`)
    }
    // Avec `npm start`, le suivi des colis est aussi mis à jour tous les quarts
    // d'heure, pour prévenir le client de l'expédition sans attendre sa visite.
    defaultApp = createApp({ ...deps, syncIntervalMs: fallbackMode === 'live' ? 15 * 60_000 : undefined })
  }
  return defaultApp
}

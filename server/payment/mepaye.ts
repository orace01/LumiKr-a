import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Order } from '../orders/types'
import type { PaymentEvent, PaymentProvider, PaymentSession } from './types'

/**
 * Paiement par Mepaye (pay.mepaye.com) : cartes Visa/Mastercard, PayPal,
 * mobile money. Documentation : https://mepaye.com/developpeur/docs
 *
 * 1. createPayment : POST /payments (montant en centimes, devise de la
 *    boutique Mepaye, numéro de commande) → `payment_url`, page hébergée par
 *    Mepaye où le client paie. Le numéro de carte ne passe jamais par le site.
 * 2. Mepaye appelle POST /api/payments/notify (webhook payment.succeeded ou
 *    payment.failed), signé en HMAC-SHA256 avec le secret du webhook.
 *
 * L'API ne prend pas d'adresse de retour par paiement : après le paiement, le
 * client revient sur le « Lien de ton site » réglé avec la clé, et la page de
 * confirmation retrouve sa commande (voir pendingOrder.ts). Elle n'offre pas
 * non plus de lecture de l'état d'un paiement : seul le webhook fait foi.
 *
 * Clés : mp_test_… (paiements simulés) et mp_live_… (encaissement réel). Une
 * clé de test n'ouvre jamais la vente réelle, et un événement de test n'est
 * accepté qu'avec une clé de test.
 */

export interface MepayeSettings {
  apiKey: string
  webhookSecret: string
  apiUrl: string
}

export function readMepayeSettings(env: NodeJS.ProcessEnv = process.env): MepayeSettings {
  return {
    apiKey: env.MEPAYE_API_KEY?.trim() ?? '',
    webhookSecret: env.MEPAYE_WEBHOOK_SECRET?.trim() ?? '',
    apiUrl: (env.MEPAYE_API_URL?.trim() || 'https://mepaye.com/api/v1').replace(/\/+$/, ''),
  }
}

interface MepayePayment {
  id: string
  status?: string
  test?: boolean
  payment_url: string
}

interface MepayeWebhook {
  event?: string
  data?: { id?: string; externalReference?: string; amount?: number; currency?: string; test?: boolean }
}

/** Consignes pour l'administrateur selon le code d'erreur Mepaye. */
const ERROR_HINTS: Record<string, string> = {
  unauthenticated: 'clé API refusée : vérifier MEPAYE_API_KEY',
  forbidden_scope: 'la clé n’a pas le droit payments:write : en créer une depuis Développeur → API Paiement',
  kyc_required: 'vérification d’identité (KYC) à terminer dans Mepaye',
  currency_mismatch: 'la devise de la boutique Mepaye doit être celle du site (EUR)',
  amount_too_low: 'montant inférieur au minimum de Mepaye',
  rate_limit_exceeded: 'trop de requêtes, réessayer dans une minute',
}

/** Téléphone au format international (+33…), seul accepté pour préremplir la page de paiement. */
export function internationalPhone(phone: string, country: string): string | null {
  const digits = phone.replace(/[^\d+]/g, '')
  if (/^\+\d{8,15}$/.test(digits)) return digits
  if (country === 'FR' && /^0\d{9}$/.test(digits)) return `+33${digits.slice(1)}`
  return null
}

export class MepayePaymentProvider implements PaymentProvider {
  readonly id = 'mepaye'
  private readonly settings: MepayeSettings
  private readonly allowTestKey: boolean
  private readonly fetch: typeof fetch

  /**
   * `allowTestKey` : vrai seulement en mode démo. En mode réel, une clé de test
   * laisse la vente fermée (un client pourrait sinon « simuler » son paiement).
   */
  constructor(settings: MepayeSettings, options: { allowTestKey?: boolean; fetch?: typeof fetch } = {}) {
    this.settings = settings
    this.allowTestKey = options.allowTestKey ?? false
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis)
  }

  /** Clé de test (mp_test_…) : paiements simulés, aucun argent réel. */
  get testMode() {
    return this.settings.apiKey.startsWith('mp_test_')
  }

  isConfigured() {
    const { apiKey, webhookSecret } = this.settings
    if (!apiKey || !webhookSecret) return false
    return this.testMode ? this.allowTestKey : apiKey.startsWith('mp_live_')
  }

  /** Ce qui manque encore, en clair (journal de démarrage). */
  missing(): string[] {
    const missing: string[] = []
    if (!this.settings.apiKey) missing.push('MEPAYE_API_KEY')
    else if (this.testMode && !this.allowTestKey) missing.push('MEPAYE_API_KEY de production (mp_live_…) : la clé actuelle est une clé de test')
    if (!this.settings.webhookSecret) missing.push('MEPAYE_WEBHOOK_SECRET')
    return missing
  }

  async createPayment({ order }: { order: Order }): Promise<PaymentSession> {
    const { customer, shippingAddress } = order
    const phone = internationalPhone(customer.phone, shippingAddress.country)
    const response = await this.fetch(`${this.settings.apiUrl}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.settings.apiKey}`,
        'Content-Type': 'application/json',
        // Rejouer la requête pour la même commande renvoie le même paiement.
        'Idempotency-Key': order.id,
      },
      body: JSON.stringify({
        amount: order.totalCents,
        currency: order.currency,
        externalReference: order.id,
        buyer: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          ...(phone ? { phone } : {}),
          country: shippingAddress.country,
        },
      }),
      signal: AbortSignal.timeout(20_000),
    })
    const payload = (await response.json().catch(() => null)) as
      | (MepayePayment & { error?: { code?: string; message?: string } })
      | null
    if (!response.ok || !payload?.payment_url || !payload.id) {
      const code = payload?.error?.code ?? `HTTP ${response.status}`
      const hint = ERROR_HINTS[payload?.error?.code ?? '']
      throw new Error(`Mepaye : ${code}${hint ? ` (${hint})` : ''}${payload?.error?.message ? ` — ${payload.error.message}` : ''}`)
    }
    return { reference: payload.id, redirectUrl: payload.payment_url }
  }

  async parseNotification(request: Request): Promise<PaymentEvent | null> {
    // La signature se calcule sur les octets reçus, avant tout JSON.parse.
    const raw = await request.text()
    const received = request.headers.get('x-mepaye-signature') ?? ''
    const expected = `sha256=${createHmac('sha256', this.settings.webhookSecret).update(raw).digest('hex')}`
    const valid =
      this.settings.webhookSecret !== '' &&
      received.length === expected.length &&
      timingSafeEqual(Buffer.from(received), Buffer.from(expected))
    if (!valid) return null

    let payload: MepayeWebhook
    try {
      payload = JSON.parse(raw) as MepayeWebhook
    } catch {
      return null
    }
    const data = payload.data
    const outcome = payload.event === 'payment.succeeded' ? 'paid' : payload.event === 'payment.failed' ? 'failed' : null
    if (!outcome || !data?.id) return null
    if (Boolean(data.test) !== this.testMode) {
      console.warn(`[paiement] notification ${data.test ? 'de test' : 'réelle'} ignorée : la clé configurée est une clé ${this.testMode ? 'de test' : 'réelle'}`)
      return null
    }
    return {
      reference: data.id,
      outcome,
      ...(typeof data.amount === 'number' ? { amountCents: data.amount } : {}),
      ...(data.currency ? { currency: data.currency } : {}),
    }
  }
}

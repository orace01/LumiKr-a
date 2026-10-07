import { randomBytes } from 'node:crypto'
import type { PaymentProvider, PaymentSession } from './types'

export interface DemoPaymentSession {
  reference: string
  orderId: string
  amountCents: number
  currency: string
  returnUrl: string
  cancelUrl: string
}

/**
 * Prestataire simulé (mode `demo` uniquement). Il envoie le client sur la page
 * /paiement-demo du site, où l'on choisit l'issue du paiement ; aucun argent ne
 * circule. Les sessions vivent en mémoire et disparaissent au redémarrage.
 */
export class DemoPaymentProvider implements PaymentProvider {
  readonly id = 'demo'
  private readonly sessions = new Map<string, DemoPaymentSession>()

  isConfigured() {
    return true
  }

  async createPayment({ order, returnUrl, cancelUrl }: Parameters<PaymentProvider['createPayment']>[0]): Promise<PaymentSession> {
    const reference = `demo_${randomBytes(9).toString('base64url')}`
    this.sessions.set(reference, {
      reference,
      orderId: order.id,
      amountCents: order.totalCents,
      currency: order.currency,
      returnUrl,
      cancelUrl,
    })
    const redirect = new URL('/paiement-demo', returnUrl)
    redirect.searchParams.set('ref', reference)
    return { reference, redirectUrl: redirect.toString() }
  }

  /** Les notifications de démo passent par /api/demo/payments, pas par le webhook. */
  async parseNotification() {
    return null
  }

  getSession(reference: string) {
    return this.sessions.get(reference) ?? null
  }
}

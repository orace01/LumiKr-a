import type { Order } from '../orders/types'

/** Ce que renvoie le prestataire quand on lui demande d'encaisser une commande. */
export interface PaymentSession {
  /** Référence de la transaction chez le prestataire. */
  reference: string
  /** Sa page de paiement : le site y envoie le client. */
  redirectUrl: string
}

export type PaymentOutcome = 'paid' | 'failed' | 'cancelled'

export interface PaymentEvent {
  reference: string
  outcome: PaymentOutcome
}

/**
 * Le branchement avec le prestataire (agrégateur) de paiement. Le numéro de
 * carte n'est jamais saisi sur le site : le client paie sur la page du
 * prestataire, puis revient ; le prestataire prévient le serveur par une
 * notification (webhook).
 */
export interface PaymentProvider {
  readonly id: string
  /** Faux tant que les clés ne sont pas fournies : la vente reste fermée. */
  isConfigured(): boolean
  createPayment(input: {
    order: Order
    /** Page où le prestataire renvoie le client après paiement. */
    returnUrl: string
    /** Page où le prestataire renvoie le client s'il abandonne. */
    cancelUrl: string
    /** Adresse de notification (POST /api/payments/notify). */
    notifyUrl: string
  }): Promise<PaymentSession>
  /**
   * Lit une notification reçue sur /api/payments/notify et VÉRIFIE qu'elle
   * vient bien du prestataire (signature). Renvoie `null` si elle est invalide.
   */
  parseNotification(request: Request): Promise<PaymentEvent | null>
  /**
   * Facultatif : demande l'état d'une transaction au prestataire. Sert de
   * filet de sécurité quand le client revient avant la notification.
   */
  fetchStatus?(reference: string): Promise<PaymentOutcome | 'pending'>
}

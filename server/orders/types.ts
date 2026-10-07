import type { CheckoutCustomer, PricedLine } from '../../src/shop/types'

/**
 * États internes d'une commande, dans l'ordre normal :
 * pending_payment → paid → sent_to_supplier → shipped → delivered.
 * Sorties possibles : payment_failed, cancelled (paiement), fulfillment_error
 * (CJ a refusé la commande : à traiter à la main, le client est déjà débité).
 */
export type OrderStatus =
  | 'pending_payment'
  | 'payment_failed'
  | 'cancelled'
  | 'paid'
  | 'sent_to_supplier'
  | 'fulfillment_error'
  | 'shipped'
  | 'delivered'

export interface Order {
  /** Numéro communiqué au client, par exemple « LK-7F3K9Q ». */
  id: string
  /** Clé secrète du lien de confirmation (le numéro seul ne suffit pas à lire la commande). */
  accessKey: string
  createdAt: string
  updatedAt: string
  status: OrderStatus
  customer: Pick<CheckoutCustomer, 'email' | 'phone' | 'firstName' | 'lastName'>
  shippingAddress: Pick<CheckoutCustomer, 'address1' | 'address2' | 'postalCode' | 'city' | 'region' | 'country'>
  shippingMethodId: string
  shippingMethodLabel: string
  lines: PricedLine[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  currency: string
  payment: {
    provider: string
    /** Référence de la transaction chez le prestataire. */
    reference: string | null
    paidAt: string | null
  }
  fulfillment: {
    provider: string
    /** Numéro de commande chez le fournisseur (CJ). */
    supplierOrderId: string | null
    carrier: string | null
    trackingNumber: string | null
    trackingUrl: string | null
    lastSyncAt: string | null
    /** Dernière erreur du fournisseur, pour l'administrateur ; jamais montrée au client. */
    error: string | null
  }
  history: { at: string; status: OrderStatus; note?: string }[]
}

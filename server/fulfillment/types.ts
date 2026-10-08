import type { Order } from '../orders/types'

export interface TrackingInfo {
  /** `cancelled` : commande annulée chez le fournisseur, à traiter à la main. */
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  carrier: string | null
  trackingNumber: string | null
  trackingUrl: string | null
}

/**
 * Le branchement avec le fournisseur qui expédie (CJdropshipping). Appelé
 * automatiquement une fois le paiement confirmé, jamais avant.
 */
export interface FulfillmentProvider {
  readonly id: string
  isConfigured(): boolean
  /** Transmet la commande au fournisseur ; renvoie son numéro de commande. */
  createOrder(order: Order): Promise<{ supplierOrderId: string }>
  /** État d'expédition et numéro de suivi ; `null` si rien de nouveau. */
  getTracking(order: Order): Promise<TrackingInfo | null>
}

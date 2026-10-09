// Types échangés entre le site et le serveur (server/). Les montants sont en
// centimes (entiers) pour éviter les erreurs d'arrondi.

export interface CartLine {
  variantId: string
  quantity: number
}

export type ShopMode = 'demo' | 'live'

/** Ce que GET /api/shop renvoie au site : catalogue et conditions de vente. */
export interface ShopInfo {
  /** `demo` : prix fictifs, paiement et fournisseur simulés. `live` : vente réelle. */
  mode: ShopMode
  /** Faux tant qu'il manque un prix ou que le paiement n'est pas raccordé. */
  saleOpen: boolean
  /** Explication affichée quand la vente est fermée. */
  closedReason: string | null
  currency: string
  locale: string
  maxQuantityPerLine: number
  variants: { id: string; label: string; priceCents: number | null }[]
  shippingMethods: { id: string; label: string; priceCents: number | null; delay: string | null }[]
  countries: { code: string; name: string }[]
  paymentProviderName: string | null
}

/** Champs du formulaire de commande. */
export interface CheckoutCustomer {
  email: string
  phone: string
  firstName: string
  lastName: string
  address1: string
  address2: string
  postalCode: string
  city: string
  region: string
  country: string
  shippingMethodId: string
  acceptTerms: boolean
}

export interface CheckoutRequest {
  customer: CheckoutCustomer
  lines: CartLine[]
}

export type FieldErrors = Partial<Record<keyof CheckoutCustomer | 'lines', string>>

export interface CheckoutResponse {
  orderId: string
  /** Page de paiement du prestataire, vers laquelle le site redirige le client. */
  redirectUrl: string
  /**
   * Page de confirmation de cette commande (avec sa clé). Gardée par le
   * navigateur pendant le paiement, pour le cas où le prestataire ne ramène
   * pas le client sur une adresse propre à la commande (Mepaye).
   */
  confirmationPath: string
}

export interface PricedLine {
  variantId: string
  label: string
  quantity: number
  unitPriceCents: number
  totalCents: number
}

/**
 * Étapes vues par le client. Elles regroupent les états internes du serveur
 * (une erreur de transmission au fournisseur reste « confirmée » côté client).
 */
export type CustomerStatus =
  | 'awaiting_payment'
  | 'payment_failed'
  | 'cancelled'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'

/** Commande telle que le client peut la consulter (confirmation, suivi). */
export interface PublicOrder {
  id: string
  status: CustomerStatus
  createdAt: string
  currency: string
  lines: PricedLine[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  shippingMethodLabel: string
  email: string
  deliverTo: {
    name: string
    address1: string
    address2: string
    postalCode: string
    city: string
    region: string
    country: string
  }
  tracking: { carrier: string | null; trackingNumber: string | null; trackingUrl: string | null } | null
  /** Date de passage à chaque étape déjà franchie. */
  steps: Partial<Record<CustomerStatus, string>>
}

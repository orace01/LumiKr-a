// Réglages de vente : devise, pays livrés, modes de livraison, paiement.
// Ce fichier est lu par le site ET par le serveur (server/), qui recalcule
// toujours les montants lui-même : un prix modifié dans le navigateur n'a
// aucun effet sur la commande.
//
// Règle : `null` = pas encore fixé. Le site affiche alors « À confirmer » et,
// en mode réel, la vente reste fermée tant qu'un prix manque.

export interface ShippingMethod {
  id: string
  label: string
  /** Prix TTC dans la devise de la boutique ; `null` tant qu'il n'est pas fixé. */
  price: number | null
  /** Délai annoncé au client, par exemple « 7 à 12 jours ouvrés ». */
  delay: string | null
  /** Nom du mode d'envoi chez CJ (« logisticName »), à reprendre dans leur back-office. */
  cjLogisticName: string | null
}

export interface Country {
  /** Code ISO 3166-1 alpha-2, celui qu'attend CJ. */
  code: string
  name: string
}

// À CONFIRMER : pays où tu livres. CJ calcule ses frais par pays.
const countries: Country[] = [{ code: 'FR', name: 'France' }]

// À CONFIRMER : prix, délai et mode d'envoi CJ correspondant.
const shippingMethods: ShippingMethod[] = [
  { id: 'standard', label: 'Livraison standard à domicile', price: null, delay: null, cjLogisticName: null },
]

export const shop = {
  /** À CONFIRMER : devise de vente (code ISO 4217). */
  currency: 'EUR',
  locale: 'fr-FR',

  /** Quantité maximale d'un même format dans une commande. */
  maxQuantityPerLine: 10,

  countries,
  shippingMethods,

  /** À CONFIRMER : nom affiché sous le bouton de paiement (« Paiement sécurisé par … »). */
  paymentProviderName: null as string | null,
}

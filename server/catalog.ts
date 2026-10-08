import { product } from '../src/config/product'
import { shop } from '../src/config/shop'
import { toCents } from '../src/shop/money'
import { missingLegalInfo } from '../src/content/legal/fields'
import type { ShopInfo, ShopMode } from '../src/shop/types'

// Prix de démonstration, utilisés UNIQUEMENT en mode `demo` et seulement pour
// les formats dont le prix n'est pas encore fixé. Le site affiche alors un
// bandeau « Mode démo : prix fictifs ». Jamais utilisés en mode `live`.
const DEMO_PRICES_CENTS: Record<string, number> = { '12x12': 1000, '15x15': 1500, '20x20': 2000, '30x20': 3000 }
const DEMO_SHIPPING_CENTS = 500

/** Catalogue tel que le serveur l'applique : c'est lui qui fait foi pour les montants. */
export function buildCatalog(mode: ShopMode, ready: { payment: boolean; fulfillment: boolean }): ShopInfo {
  const demo = mode === 'demo'
  const variants = product.variants.map((variant) => ({
    id: variant.id,
    label: variant.label,
    priceCents: variant.price !== null ? toCents(variant.price) : demo ? (DEMO_PRICES_CENTS[variant.id] ?? null) : null,
  }))
  const shippingMethods = shop.shippingMethods.map((method) => ({
    id: method.id,
    label: method.label,
    priceCents: method.price !== null ? toCents(method.price) : demo ? DEMO_SHIPPING_CENTS : null,
    delay: method.delay ?? (demo ? 'Délai fictif (mode démo)' : null),
  }))

  let closedReason: string | null = null
  if (variants.some((variant) => variant.priceCents === null)) {
    closedReason = 'Les prix ne sont pas encore fixés.'
  } else if (shippingMethods.some((method) => method.priceCents === null)) {
    closedReason = 'Les frais de livraison ne sont pas encore fixés.'
  } else if (!demo && missingLegalInfo().length > 0) {
    // Vendre en ligne sans identité du vendeur, délai ni médiateur est interdit.
    closedReason = 'Les informations légales du vendeur ne sont pas complètes.'
  } else if (!ready.payment) {
    closedReason = 'Le paiement en ligne n’est pas encore raccordé.'
  } else if (!ready.fulfillment) {
    // Encaisser sans pouvoir transmettre la commande au fournisseur laisserait
    // des clients débités sans envoi : la vente attend les deux raccordements.
    closedReason = 'La transmission des commandes au fournisseur n’est pas encore raccordée.'
  }

  return {
    mode,
    saleOpen: closedReason === null,
    closedReason,
    currency: shop.currency,
    locale: shop.locale,
    maxQuantityPerLine: shop.maxQuantityPerLine,
    variants,
    shippingMethods,
    countries: shop.countries,
    // En démo, le bandeau « paiement simulé » suffit : pas de nom de prestataire.
    paymentProviderName: demo ? null : shop.paymentProviderName,
  }
}

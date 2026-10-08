import { product } from '../config/product'
import { shop } from '../config/shop'
import { useShop } from '../shop/useShop'
import './DemoBanner.css'

// En démo, seuls les prix pas encore fixés sont remplacés par des prix fictifs.
const fictionalPrices = [...product.variants, ...shop.shippingMethods].some((item) => item.price === null)

/** Rappel permanent qu'en mode démo, le paiement est simulé (et les prix manquants fictifs). */
export function DemoBanner() {
  const { info } = useShop()
  if (info?.mode !== 'demo') return null
  return (
    <p className="demo-banner" role="note">
      Mode démo · {fictionalPrices ? 'prix fictifs · ' : ''}paiement simulé
    </p>
  )
}

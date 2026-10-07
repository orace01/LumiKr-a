import { useShop } from '../shop/useShop'
import './DemoBanner.css'

/** Rappel permanent qu'en mode démo, les prix sont fictifs et le paiement simulé. */
export function DemoBanner() {
  const { info } = useShop()
  if (info?.mode !== 'demo') return null
  return (
    <p className="demo-banner" role="note">
      Mode démo · prix fictifs · paiement simulé
    </p>
  )
}

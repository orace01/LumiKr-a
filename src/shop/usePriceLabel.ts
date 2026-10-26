import { useShop } from './useShop'

/** Prix d'un format tel que le serveur l'annonce (« 32,90 € », « … » pendant le chargement). */
export function usePriceLabel() {
  const { status, money, priceOf } = useShop()
  return (variantId: string) => {
    if (status === 'loading') return '…'
    const cents = priceOf(variantId)
    return cents === null ? 'Prix à venir' : money(cents)
  }
}

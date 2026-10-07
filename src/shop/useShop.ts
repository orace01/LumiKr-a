import { createContext, useCallback, useContext } from 'react'
import { shop as shopConfig } from '../config/shop'
import { formatMoney } from './money'
import type { ShopInfo } from './types'

export type ShopState = { status: 'loading' } | { status: 'ready'; info: ShopInfo } | { status: 'error' }

export const ShopContext = createContext<ShopState>({ status: 'loading' })

/** Catalogue, prix et état de la vente, chargés par <ShopProvider>. */
export function useShop() {
  const state = useContext(ShopContext)
  const info = state.status === 'ready' ? state.info : null

  const money = useCallback(
    (cents: number) => formatMoney(cents, info?.currency ?? shopConfig.currency, info?.locale ?? shopConfig.locale),
    [info],
  )
  const priceOf = useCallback(
    (variantId: string) => info?.variants.find((variant) => variant.id === variantId)?.priceCents ?? null,
    [info],
  )

  return { status: state.status, info, money, priceOf, saleOpen: info?.saleOpen === true }
}

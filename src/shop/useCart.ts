import { createContext, useContext } from 'react'
import type { CartLine } from './types'

export interface CartContextValue {
  lines: CartLine[]
  /** Nombre total d'articles. */
  count: number
  add: (variantId: string, quantity: number) => void
  setQuantity: (variantId: string, quantity: number) => void
  remove: (variantId: string) => void
  clear: () => void
  isOpen: boolean
  open: () => void
  close: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

/** Panier du visiteur, fourni par <CartProvider>. */
export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCart doit être utilisé dans <CartProvider>.')
  return cart
}

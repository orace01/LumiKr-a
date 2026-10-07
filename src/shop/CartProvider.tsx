import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { product } from '../config/product'
import { shop } from '../config/shop'
import { mergeLines } from './pricing'
import type { CartLine } from './types'
import { CartContext } from './useCart'

const STORAGE_KEY = 'lumikrea:panier:v1'

const clamp = (quantity: number) => Math.min(shop.maxQuantityPerLine, Math.max(1, Math.round(quantity)))

/** Ne garde que des formats existants et des quantités valides. */
function sanitize(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return []
  const known = new Set(product.variants.map((variant) => variant.id))
  const lines = value.flatMap((line) =>
    line && typeof line.variantId === 'string' && known.has(line.variantId) && Number.isFinite(line.quantity)
      ? [{ variantId: line.variantId as string, quantity: clamp(line.quantity) }]
      : [],
  )
  return mergeLines(lines).map((line) => ({ ...line, quantity: clamp(line.quantity) }))
}

// Le panier est gardé dans le navigateur (localStorage), pour survivre à un
// rechargement ou à un aller-retour sur la page de paiement. Le navigateur
// peut refuser cet accès (navigation privée) : le panier reste alors en mémoire.
function load(): CartLine[] {
  try {
    return sanitize(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]'))
  } catch {
    return []
  }
}

function save(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // Stockage indisponible : sans conséquence pour la visite en cours.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => save(lines), [lines])

  // Un panier modifié dans un autre onglet se répercute ici.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setLines(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback((variantId: string, quantity: number) => {
    setLines((current) => sanitize([...current, { variantId, quantity }]))
  }, [])
  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((current) => current.map((line) => (line.variantId === variantId ? { ...line, quantity: clamp(quantity) } : line)))
  }, [])
  const remove = useCallback((variantId: string) => {
    setLines((current) => current.filter((line) => line.variantId !== variantId))
  }, [])
  const clear = useCallback(() => setLines([]), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      isOpen,
      open,
      close,
    }),
    [lines, add, setQuantity, remove, clear, isOpen, open, close],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

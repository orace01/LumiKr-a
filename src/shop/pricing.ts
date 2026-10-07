import type { CartLine, PricedLine, ShopInfo } from './types'

type Catalog = Pick<ShopInfo, 'variants' | 'shippingMethods' | 'maxQuantityPerLine'>

export type Quote =
  | {
      ok: true
      lines: PricedLine[]
      subtotalCents: number
      /** `null` quand aucun mode de livraison n'est encore choisi. */
      shippingCents: number | null
      totalCents: number
    }
  | { ok: false; reason: string }

/** Regroupe les lignes d'un même format (le panier peut en recevoir plusieurs). */
export function mergeLines(lines: CartLine[]): CartLine[] {
  const quantities = new Map<string, number>()
  for (const line of lines) quantities.set(line.variantId, (quantities.get(line.variantId) ?? 0) + line.quantity)
  return [...quantities].map(([variantId, quantity]) => ({ variantId, quantity }))
}

/**
 * Calcule le montant d'un panier. Le site s'en sert pour l'affichage ; le
 * serveur l'appelle à nouveau avec son propre catalogue au moment de commander.
 */
export function quote(catalog: Catalog, lines: CartLine[], shippingMethodId?: string): Quote {
  const merged = mergeLines(lines)
  if (merged.length === 0) return { ok: false, reason: 'Le panier est vide.' }

  const priced: PricedLine[] = []
  for (const line of merged) {
    const variant = catalog.variants.find((candidate) => candidate.id === line.variantId)
    if (!variant) return { ok: false, reason: 'Un format du panier n’existe plus.' }
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > catalog.maxQuantityPerLine) {
      return { ok: false, reason: `La quantité doit être comprise entre 1 et ${catalog.maxQuantityPerLine}.` }
    }
    if (variant.priceCents === null) return { ok: false, reason: `Le prix du ${variant.label} n’est pas encore fixé.` }
    priced.push({
      variantId: variant.id,
      label: variant.label,
      quantity: line.quantity,
      unitPriceCents: variant.priceCents,
      totalCents: variant.priceCents * line.quantity,
    })
  }

  const subtotalCents = priced.reduce((sum, line) => sum + line.totalCents, 0)
  if (shippingMethodId === undefined) {
    return { ok: true, lines: priced, subtotalCents, shippingCents: null, totalCents: subtotalCents }
  }

  const method = catalog.shippingMethods.find((candidate) => candidate.id === shippingMethodId)
  if (!method) return { ok: false, reason: 'Ce mode de livraison n’est pas proposé.' }
  if (method.priceCents === null) return { ok: false, reason: 'Le prix de la livraison n’est pas encore fixé.' }
  return {
    ok: true,
    lines: priced,
    subtotalCents,
    shippingCents: method.priceCents,
    totalCents: subtotalCents + method.priceCents,
  }
}

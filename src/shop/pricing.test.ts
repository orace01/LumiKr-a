import { describe, expect, it } from 'vitest'
import { mergeLines, quote } from './pricing'

const catalog = {
  maxQuantityPerLine: 10,
  variants: [
    { id: 'a', label: 'Format A', priceCents: 1990 },
    { id: 'b', label: 'Format B', priceCents: 2490 },
    { id: 'c', label: 'Format C', priceCents: null },
  ],
  shippingMethods: [
    { id: 'standard', label: 'Standard', priceCents: 490, delay: null },
    { id: 'express', label: 'Express', priceCents: null, delay: null },
  ],
}

describe('mergeLines', () => {
  it('regroupe les lignes d’un même format', () => {
    expect(mergeLines([{ variantId: 'a', quantity: 1 }, { variantId: 'b', quantity: 2 }, { variantId: 'a', quantity: 3 }])).toEqual([
      { variantId: 'a', quantity: 4 },
      { variantId: 'b', quantity: 2 },
    ])
  })
})

describe('quote', () => {
  it('calcule sous-total, livraison et total en centimes', () => {
    const result = quote(catalog, [{ variantId: 'a', quantity: 2 }, { variantId: 'b', quantity: 1 }], 'standard')
    expect(result).toMatchObject({ ok: true, subtotalCents: 6470, shippingCents: 490, totalCents: 6960 })
  })

  it('sans mode de livraison, laisse la livraison à calculer', () => {
    expect(quote(catalog, [{ variantId: 'a', quantity: 1 }])).toMatchObject({ ok: true, shippingCents: null, totalCents: 1990 })
  })

  it('refuse un panier vide, un format inconnu ou sans prix', () => {
    expect(quote(catalog, []).ok).toBe(false)
    expect(quote(catalog, [{ variantId: 'z', quantity: 1 }]).ok).toBe(false)
    expect(quote(catalog, [{ variantId: 'c', quantity: 1 }]).ok).toBe(false)
  })

  it('refuse une quantité hors limites ou non entière', () => {
    expect(quote(catalog, [{ variantId: 'a', quantity: 0 }]).ok).toBe(false)
    expect(quote(catalog, [{ variantId: 'a', quantity: 11 }]).ok).toBe(false)
    expect(quote(catalog, [{ variantId: 'a', quantity: 1.5 }]).ok).toBe(false)
    // La limite s'applique après regroupement des lignes.
    expect(quote(catalog, [{ variantId: 'a', quantity: 6 }, { variantId: 'a', quantity: 6 }]).ok).toBe(false)
  })

  it('refuse un mode de livraison inconnu ou sans prix', () => {
    expect(quote(catalog, [{ variantId: 'a', quantity: 1 }], 'drone').ok).toBe(false)
    expect(quote(catalog, [{ variantId: 'a', quantity: 1 }], 'express').ok).toBe(false)
  })
})

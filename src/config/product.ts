// Données produit centralisées.
//
// Règle : une information n'est affichée comme acquise que si `verified` vaut
// `true`. Tout le reste est rendu avec une pastille « À confirmer » ; passer
// `verified` à `true` (et renseigner `value`) une fois la fiche fournisseur
// vérifiée suffit à la faire disparaître.

export interface Fact {
  label: string
  /** `null` : information inconnue, seule la pastille est affichée. */
  value: string | null
  verified: boolean
}

export interface Variant {
  id: string
  label: string
  shape: 'Carré' | 'Paysage'
  widthCm: number
  heightCm: number
  /** Prix TTC en euros. `null` tant qu'il n'est pas fixé : rien n'est affiché. */
  price: number | null
}

export interface PenColor {
  name: string
  hex: string
}

// Formats vendus (choix du 2 octobre 2026 : les quatre). Dimensions relevées
// sur les visuels fournisseur.
const variants: Variant[] = [
  { id: '12x12', label: '12 × 12 cm', shape: 'Carré', widthCm: 12, heightCm: 12, price: null },
  { id: '15x15', label: '15 × 15 cm', shape: 'Carré', widthCm: 15, heightCm: 15, price: null },
  { id: '20x20', label: '20 × 20 cm', shape: 'Carré', widthCm: 20, heightCm: 20, price: null },
  { id: '30x20', label: '30 × 20 cm', shape: 'Paysage', widthCm: 30, heightCm: 20, price: null },
]

// Couleurs de feutres visibles sur le visuel fournisseur ; elles servent aussi
// de palette à la démonstration interactive.
const penColors: PenColor[] = [
  { name: 'Jaune', hex: '#ffe14a' },
  { name: 'Vert', hex: '#4ee35f' },
  { name: 'Bleu', hex: '#4f8dff' },
  { name: 'Violet', hex: '#b06bff' },
  { name: 'Rose', hex: '#ff6fb1' },
  { name: 'Orange', hex: '#ff8f33' },
  { name: 'Blanc', hex: '#fffaf0' },
]

const inTheBox: Fact[] = [
  { label: 'Plaque en acrylique transparent', value: 'Au format choisi', verified: true },
  { label: 'Base lumineuse LED', value: 'Alimentée en USB', verified: true },
  { label: 'Support', value: 'Pour poser le tableau', verified: true },
  { label: 'Feutres de couleur', value: '7 feutres', verified: false },
  { label: 'Câble USB', value: null, verified: false },
  { label: 'Adaptateur secteur', value: null, verified: false },
]

const specs: Fact[] = [
  { label: 'Matériau', value: 'Acrylique transparent', verified: true },
  { label: 'Éclairage', value: 'LED, par la base', verified: true },
  { label: 'Alimentation', value: 'USB', verified: true },
  { label: 'Surface', value: 'Effaçable', verified: true },
  { label: 'Couleur de la lumière', value: null, verified: false },
  { label: 'Interrupteur ou réglages', value: null, verified: false },
  { label: 'Méthode d’effaçage', value: null, verified: false },
  { label: 'Âge conseillé', value: null, verified: false },
  { label: 'Consignes de sécurité', value: null, verified: false },
]

export const product = {
  name: 'Tableau lumineux à dessiner',
  shortDescription:
    'Un tableau en acrylique transparent, effaçable et éclairé par LED, pour dessiner, laisser un mot ou décorer.',

  variants,
  defaultVariantId: '20x20',
  dimensionsVerified: false,

  penColors,
  inTheBox,
  specs,

  // Raccordement de la vente : géré séparément. Tant que `url` est `null`, le
  // bloc achat affiche un état « bientôt disponible » et aucun faux panier.
  checkout: {
    url: null as string | null,
  },
}

export function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(price)
}

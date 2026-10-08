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
  /**
   * Prix TTC dans la devise de la boutique (src/config/shop.ts). `null` tant
   * qu'il n'est pas fixé : le site affiche « À confirmer » et, en mode réel, la
   * vente reste fermée.
   */
  price: number | null
  /** Identifiant de la variante chez CJ (« vid »), à reprendre dans leur back-office. */
  cjVariantId: string | null
}

export interface PenColor {
  name: string
  hex: string
}

// Formats vendus (choix du 2 octobre 2026 : les quatre). Dimensions relevées
// sur les visuels fournisseur. Prix TTC livraison offerte, fixés le 7 octobre
// 2026 (grille « équilibrée ») d'après le coût réel CJ livré en France :
// 14,50 € (12 × 12) à 17,36 € (30 × 20). Identifiants CJ relevés avec `npm run cj -- produit`.
const variants: Variant[] = [
  { id: '12x12', label: '12 × 12 cm', shape: 'Carré', widthCm: 12, heightCm: 12, price: 24.9, cjVariantId: '2503201410581618700' },
  { id: '15x15', label: '15 × 15 cm', shape: 'Carré', widthCm: 15, heightCm: 15, price: 27.9, cjVariantId: '2503201410581619100' },
  { id: '20x20', label: '20 × 20 cm', shape: 'Carré', widthCm: 20, heightCm: 20, price: 32.9, cjVariantId: '2503201410581619300' },
  { id: '30x20', label: '30 × 20 cm', shape: 'Paysage', widthCm: 30, heightCm: 20, price: 36.9, cjVariantId: '2503201410581619500' },
]

// Couleurs visibles sur les visuels fournisseur : palette de la démonstration
// interactive et des décors. Le nombre de feutres fournis est dans `inTheBox`.
const penColors: PenColor[] = [
  { name: 'Jaune', hex: '#ffe14a' },
  { name: 'Vert', hex: '#4ee35f' },
  { name: 'Bleu', hex: '#4f8dff' },
  { name: 'Violet', hex: '#b06bff' },
  { name: 'Rose', hex: '#ff6fb1' },
  { name: 'Orange', hex: '#ff8f33' },
  { name: 'Blanc', hex: '#fffaf0' },
]

// Contenu et caractéristiques d'après la fiche CJ du produit (CJYD2333071,
// lue le 8 octobre 2026). Liste de colisage CJ : « Drawing board LED light +
// Pen x1pc » ; un seul feutre, bien que certaines photos fournisseur en
// montrent sept. Les informations absentes de la fiche (couleur de la
// lumière, interrupteur, âge, consignes de sécurité) ne sont pas affichées.
const inTheBox: Fact[] = [
  { label: 'Plaque en acrylique transparent', value: 'Au format choisi', verified: true },
  { label: 'Base lumineuse LED', value: 'Branchement USB direct', verified: true },
  { label: 'Support', value: 'Réglable', verified: true },
  { label: 'Feutre', value: '1 fourni', verified: true },
]

const specs: Fact[] = [
  { label: 'Matériau', value: 'Acrylique transparent', verified: true },
  { label: 'Éclairage', value: 'LED, par la base', verified: true },
  { label: 'Alimentation', value: 'USB ; adaptateur secteur non fourni', verified: true },
  { label: 'Surface', value: 'Effaçable à sec, réutilisable', verified: true },
  { label: 'Usages', value: 'Dessin, messages, décoration, veilleuse', verified: true },
]

export const product = {
  name: 'Tableau lumineux à dessiner',
  shortDescription:
    'Un tableau en acrylique transparent, effaçable et éclairé par LED, pour dessiner, laisser un mot ou décorer.',

  variants,
  defaultVariantId: '20x20',
  // Dimensions des plaques d'après la fiche CJ (mesurées à la main par le fournisseur).
  dimensionsVerified: true,

  penColors,
  inTheBox,
  specs,
}

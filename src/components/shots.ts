import shotBonjour from '../assets/media/shot-bonjour.webp'
import shotFleurs from '../assets/media/shot-fleurs.webp'
import shotFusee from '../assets/media/shot-fusee.webp'
import shotSirene from '../assets/media/shot-sirene.webp'
import { product } from '../config/product'

export interface Shot {
  id: string
  variantId: string
  src: string
  width: number
  height: number
  alt: string
}

// Le produit entier, un visuel fournisseur par format, du plus petit au plus
// grand, sans décor de fête. Sur ordinateur ils surgissent autour de la photo
// du hero une fois resserrée ; sur téléphone ils défilent du doigt sous le titre.
//
// À CONFIRMER : le fournisseur ne montre le 15 × 15 cm qu'avec un dessin de
// Noël. Le tableau aux fleurs, carré lui aussi, le représente ici, mais sa
// taille n'est pas indiquée sur la photo d'origine. Le « Good Morning » est en
// paysage : c'est donc le 30 × 20 cm, seul format paysage vendu.
export const SHOTS: Shot[] = [
  {
    id: 'fusee',
    variantId: '12x12',
    src: shotFusee,
    width: 796,
    height: 784,
    alt: 'Le tableau carré avec une fusée et des planètes dessinées, éclairé par sa base.',
  },
  {
    id: 'fleurs',
    variantId: '15x15',
    src: shotFleurs,
    width: 1240,
    height: 976,
    alt: 'Le tableau avec une guirlande de fleurs multicolores et les mots « Good Morning » et « Happy Sunday ».',
  },
  {
    id: 'sirene',
    variantId: '20x20',
    src: shotSirene,
    width: 748,
    height: 760,
    alt: 'Le tableau carré avec une sirène dessinée, allumé dans une pièce sombre.',
  },
  {
    id: 'bonjour',
    variantId: '30x20',
    src: shotBonjour,
    width: 800,
    height: 436,
    alt: 'Le tableau paysage posé sur un bureau, avec « Good Morning » écrit en jaune et une fleur rouge.',
  },
]

export const formatLabel = (variantId: string) => product.variants.find((variant) => variant.id === variantId)?.label

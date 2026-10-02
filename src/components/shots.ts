import shotFusee from '../assets/media/shot-fusee.webp'
import shotNoel from '../assets/media/shot-noel.webp'
import shotNouvelAn from '../assets/media/shot-nouvel-an.webp'
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
// grand. Sur ordinateur ils surgissent autour de la vidéo refermée ; sur
// téléphone ils défilent du doigt sous le titre.
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
    id: 'noel',
    variantId: '15x15',
    src: shotNoel,
    width: 800,
    height: 800,
    alt: 'Le tableau carré avec un père Noël, des cadeaux et des flocons dessinés.',
  },
  {
    id: 'sirene',
    variantId: '20x20',
    src: shotSirene,
    width: 744,
    height: 744,
    alt: 'Le tableau carré avec une sirène dessinée, allumé dans une pièce sombre.',
  },
  {
    id: 'nouvel-an',
    variantId: '30x20',
    src: shotNouvelAn,
    width: 1080,
    height: 744,
    alt: 'Le tableau paysage avec des fanions et « Happy New Year » écrits aux feutres.',
  },
]

export const formatLabel = (variantId: string) => product.variants.find((variant) => variant.id === variantId)?.label

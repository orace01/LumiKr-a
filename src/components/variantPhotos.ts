import photo12 from '../assets/media/format-12x12.webp'
import photo15 from '../assets/media/format-15x15.webp'
import photo20 from '../assets/media/format-20x20.webp'
import photo30 from '../assets/media/format-30x20.webp'
import scene12 from '../assets/media/galerie-12x12.webp'
import scene15 from '../assets/media/galerie-15x15.webp'
import enfant from '../assets/media/galerie-enfant.webp'
import formats from '../assets/media/galerie-formats.webp'
import message from '../assets/media/galerie-message.webp'
import sirene from '../assets/media/galerie-sirene.webp'

/** Vignette 4:3 de chaque format, par identifiant de variante. */
export const VARIANT_PHOTOS: Record<string, string | undefined> = {
  '12x12': photo12,
  '15x15': photo15,
  '20x20': photo20,
  '30x20': photo30,
}

export interface GalleryPhoto {
  src: string
  alt: string
}

// Photos fournisseur (CJYD2333071, « Marketing Picture »), sans celles qui
// portent du texte anglais incrusté ou montrent sept feutres (un seul est fourni).
const shared: GalleryPhoto[] = [
  { src: enfant, alt: 'Un enfant écrit à son bureau, le tableau allumé à côté de lui.' },
  { src: message, alt: 'Un message écrit au feutre sur le tableau allumé, posé sur une table.' },
  { src: sirene, alt: 'Une sirène dessinée en couleurs sur la plaque.' },
  { src: formats, alt: 'Les quatre formats côte à côte, avec leurs dimensions.' },
]

const scenes: Record<string, GalleryPhoto | undefined> = {
  '12x12': { src: scene12, alt: 'Le format 12 × 12 cm allumé, une fusée dessinée dessus, au pied du sapin.' },
  '15x15': { src: scene15, alt: 'Le format 15 × 15 cm allumé, un dessin de Noël dessus, près de cadeaux.' },
}

/** Galerie de la fiche d'un format : sa photo, sa mise en scène si elle existe, puis les photos communes. */
export function variantGallery(variantId: string, label: string): GalleryPhoto[] {
  const main = VARIANT_PHOTOS[variantId]
  const scene = scenes[variantId]
  return [
    ...(main ? [{ src: main, alt: `Le tableau lumineux ${label}, allumé, avec un dessin en couleurs.` }] : []),
    ...(scene ? [scene] : []),
    ...shared,
  ]
}

/** Teinte de fond de chaque format dans la boutique (couleurs des feutres de la marque, global.css). */
export const VARIANT_TINTS: Record<string, string> = {
  '12x12': 'var(--pink)',
  '15x15': 'var(--green)',
  '20x20': 'var(--blue)',
  '30x20': 'var(--violet)',
}

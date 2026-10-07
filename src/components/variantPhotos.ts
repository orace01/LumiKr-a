import photo12 from '../assets/media/format-12x12.webp'
import photo15 from '../assets/media/format-15x15.webp'
import photo20 from '../assets/media/format-20x20.webp'
import photo30 from '../assets/media/format-30x20.webp'

/** Vignette 4:3 de chaque format, par identifiant de variante. */
export const VARIANT_PHOTOS: Record<string, string | undefined> = {
  '12x12': photo12,
  '15x15': photo15,
  '20x20': photo20,
  '30x20': photo30,
}

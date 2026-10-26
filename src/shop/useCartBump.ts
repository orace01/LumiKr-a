import { useEffect, useState } from 'react'
import { onCartBump } from './cartEffects'

/** Classe à poser sur une pastille du panier : elle rebondit à chaque ajout (Toast.css). */
export function useCartBump() {
  const [bumping, setBumping] = useState(false)
  useEffect(
    () =>
      onCartBump(() => {
        setBumping(false)
        requestAnimationFrame(() => setBumping(true))
      }),
    [],
  )
  return { className: bumping ? 'is-bumping' : '', onAnimationEnd: () => setBumping(false) }
}

import { useSyncExternalStore } from 'react'

/** Vrai tant que la requête média correspond (largeur d'écran, mouvement réduit…). */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

/** Largeur à partir de laquelle le site passe en mise en page ordinateur (Header.css). */
export const WIDE_SCREEN = '(min-width: 900px)'
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

import { useMediaQuery } from './useMediaQuery'

/**
 * Vrai sur téléphone. Le début de page y est différent : pas de hero, les
 * photos des formats défilent du doigt sous le titre.
 *
 * Doit rester aligné sur les règles `@media (max-width: 720px)` de Intro.css.
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 720px)')
}

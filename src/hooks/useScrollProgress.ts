import { useEffect, type RefObject } from 'react'

/**
 * Expose l'avancement du défilement à travers un élément « épinglé » dans la
 * variable CSS `--p` (0 quand son haut touche le haut de la fenêtre, 1 quand
 * son bas touche le bas). Toute l'animation est ensuite écrite en CSS.
 *
 * `frozen` fige l'état final (`--p: 1`), pour les animations réduites.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, frozen: boolean) {
  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (frozen) {
      node.style.setProperty('--p', '1')
      return
    }

    let frame = 0
    const update = () => {
      frame = 0
      const rect = node.getBoundingClientRect()
      const distance = rect.height - window.innerHeight
      const progress = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0
      node.style.setProperty('--p', progress.toFixed(4))
    }
    // Une seule mise à jour par image, quel que soit le nombre d'événements.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [ref, frozen])
}

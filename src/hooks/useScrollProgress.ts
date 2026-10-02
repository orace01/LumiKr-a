import { useEffect, type RefObject } from 'react'

/**
 * Comment mesurer l'avancement :
 * - `pin`  : l'élément est plus haut que la fenêtre et contient une scène
 *   épinglée. 0 quand son haut touche le haut de la fenêtre, 1 quand son bas
 *   touche le bas.
 * - `view` : l'élément traverse simplement la fenêtre. 0 quand son haut entre
 *   par le bas, 1 quand son bas sort par le haut.
 */
type ProgressMode = 'pin' | 'view'

const clamp = (value: number) => Math.min(1, Math.max(0, value))

/**
 * Expose l'avancement du défilement dans la variable CSS `--p` de l'élément.
 * Toute l'animation est ensuite écrite en CSS, à partir de `--p`.
 *
 * `frozen` (animations réduites) fige la valeur : l'état final pour `pin`,
 * le milieu de course pour `view`.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, frozen: boolean, mode: ProgressMode = 'pin') {
  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (frozen) {
      node.style.setProperty('--p', mode === 'pin' ? '1' : '0.5')
      return
    }

    let frame = 0
    const update = () => {
      frame = 0
      const rect = node.getBoundingClientRect()
      let progress: number
      if (mode === 'pin') {
        const distance = rect.height - window.innerHeight
        progress = distance > 0 ? clamp(-rect.top / distance) : 0
      } else {
        progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height))
      }
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
  }, [ref, frozen, mode])
}

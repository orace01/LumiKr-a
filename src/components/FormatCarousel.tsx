import { useEffect, useRef, useState } from 'react'
import { formatLabel, SHOTS } from './shots'
import './FormatCarousel.css'

/**
 * Les photos des quatre formats, à faire défiler du doigt. Le défilement est
 * natif (scroll-snap) ; le JavaScript ne sert qu'aux points de repère.
 */
export function FormatCarousel() {
  const trackRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)

  // La photo « active » est celle qui occupe l'essentiel de la bande visible.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index))
        }
      },
      { root: track, threshold: 0.6 },
    )
    for (const card of track.children) observer.observe(card)
    return () => observer.disconnect()
  }, [])

  const goTo = (index: number) => {
    const track = trackRef.current
    const card = track?.children[index] as HTMLElement | undefined
    if (!track || !card) return
    // Défilement horizontal seulement : la page ne bouge pas.
    track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2 })
  }

  return (
    <div className="carousel" role="group" aria-label="Le tableau dans ses quatre formats">
      <ul ref={trackRef} className="carousel__track">
        {SHOTS.map((shot, index) => (
          <li key={shot.id} className="carousel__card" data-index={index}>
            <img
              src={shot.src}
              width={shot.width}
              height={shot.height}
              alt={shot.alt}
              decoding="async"
              // Les deux premières photos sont visibles dès l'arrivée (la seconde
              // dépasse à droite) ; la première est le plus grand visuel de l'écran.
              loading={index < 2 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
            <span className="carousel__label">{formatLabel(shot.variantId)}</span>
          </li>
        ))}
      </ul>

      <div className="carousel__dots">
        {SHOTS.map((shot, index) => (
          <button
            key={shot.id}
            type="button"
            className="carousel__dot"
            aria-label={`Voir le format ${formatLabel(shot.variantId)}`}
            aria-current={index === active ? 'true' : undefined}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  )
}

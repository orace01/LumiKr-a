import { useRef } from 'react'
import heroPhoto from '../assets/media/hero-photo.webp'
import { useIsMobile } from '../hooks/useIsMobile'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { Doodle } from './Doodle'
import { formatLabel, SHOTS } from './shots'
import './Hero.css'

/**
 * La photo plein écran, jusque sous le header. Elle reste épinglée pendant le
 * défilement, se resserre au centre, puis les photos des formats
 * surgissent autour. Le titre et les boutons suivent dans Intro.
 */
function HeroStage() {
  const pinRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  useScrollProgress(pinRef, reducedMotion)

  return (
    <section className="hero" aria-label="Le tableau lumineux en photos">
      <div ref={pinRef} className="hero__pin">
        <div className="hero__stage">
          <div className="hero__media">
            <img
              className="hero__photo"
              src={heroPhoto}
              width={2048}
              height={1144}
              alt="Le tableau lumineux posé sur un bureau, avec un message écrit aux feutres de couleur, « Good Morning » en jaune et une fleur rouge."
              fetchPriority="high"
            />
          </div>

          <ul className="hero__collage">
            {SHOTS.map((shot) => (
              <li key={shot.id} className={`hero__shot hero__shot--${shot.id}`}>
                <img src={shot.src} width={shot.width} height={shot.height} alt={shot.alt} decoding="async" />
                <span className="hero__shot-label">{formatLabel(shot.variantId)}</span>
              </li>
            ))}
          </ul>
          <Doodle shape="star" color="var(--glow)" filled className="hero__pop hero__pop--star" />
          <Doodle shape="sparkle" color="var(--pink)" filled className="hero__pop hero__pop--sparkle" />
          <Doodle shape="squiggle" color="var(--green)" className="hero__pop hero__pop--squiggle" />

          <a className="hero__scroll" href="#decouvrir">
            <span className="visually-hidden">Découvrir le tableau</span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
              <path
                d="M6 9.5l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

/**
 * Sur téléphone, Intro est le premier écran (photos des formats à faire
 * défiler) : rien n'est rendu ici et la photo n'est pas téléchargée.
 */
export function Hero() {
  const mobile = useIsMobile()
  return mobile ? null : <HeroStage />
}

import { useRef } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { Doodle } from './Doodle'
import { HeroVideo } from './HeroVideo'
import { formatLabel, SHOTS } from './shots'
import './Hero.css'

/**
 * La vidéo plein écran. Elle reste épinglée pendant le défilement, se referme
 * en pastille, puis les photos surgissent autour. Le titre et les boutons
 * suivent dans Intro.
 */
function HeroStage() {
  const pinRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  useScrollProgress(pinRef, reducedMotion)

  return (
    <section className="hero" aria-label="Le tableau lumineux en vidéo et en photos">
      <div ref={pinRef} className="hero__pin">
        <div className="hero__stage">
          <HeroVideo />

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
 * Sur téléphone il n'y a pas de vidéo : rien n'est rendu ici (ni la vidéo ni
 * son image d'attente ne sont téléchargées) et Intro devient le premier écran.
 */
export function Hero() {
  const mobile = useIsMobile()
  return mobile ? null : <HeroStage />
}

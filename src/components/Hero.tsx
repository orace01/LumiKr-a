import { useRef } from 'react'
import shotBonjour from '../assets/media/shot-bonjour.webp'
import shotFusee from '../assets/media/shot-fusee.webp'
import shotNouvelAn from '../assets/media/shot-nouvel-an.webp'
import shotSirene from '../assets/media/shot-sirene.webp'
import { product } from '../config/product'
import { site } from '../config/site'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { Doodle } from './Doodle'
import { HeroVideo } from './HeroVideo'
import { Reveal } from './Reveal'
import './Hero.css'

// Photos qui surgissent autour de la vidéo une fois refermée.
const SHOTS = [
  {
    id: 'fusee',
    src: shotFusee,
    width: 398,
    height: 392,
    alt: 'Le petit format carré avec une fusée et des planètes dessinées, éclairé par sa base.',
  },
  {
    id: 'nouvel-an',
    src: shotNouvelAn,
    width: 540,
    height: 372,
    alt: 'Le format paysage avec des fanions et « Happy New Year » écrits aux feutres.',
  },
  {
    id: 'bonjour',
    src: shotBonjour,
    width: 1000,
    height: 430,
    alt: 'Gros plan sur la base lumineuse posée sur un bureau, sous un « Good Morning » et une fleur rouge.',
  },
  {
    id: 'sirene',
    src: shotSirene,
    width: 372,
    height: 372,
    alt: 'Le format carré avec une sirène dessinée, allumé dans une pièce sombre.',
  },
]

export function Hero() {
  const pinRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  useScrollProgress(pinRef, reducedMotion)

  return (
    <section id="accueil" className="hero" aria-labelledby="hero-title">
      {/* Écran 1 : la vidéo seule, plein écran. Elle reste épinglée pendant le
          défilement, se referme en pastille, puis les photos surgissent autour. */}
      <div ref={pinRef} className="hero__pin">
        <div className="hero__stage">
          <HeroVideo />

          <ul className="hero__collage">
            {SHOTS.map((shot) => (
              <li key={shot.id} className={`hero__shot hero__shot--${shot.id}`}>
                <img src={shot.src} width={shot.width} height={shot.height} alt={shot.alt} decoding="async" />
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

      {/* Écran 2 : la promesse et les actions, sur fond clair. */}
      <div id="decouvrir" className="hero__intro">
        <div className="container hero__intro-inner">
          <Doodle shape="squiggle" color="var(--pink)" className="hero__doodle hero__doodle--squiggle" />
          <Doodle shape="sparkle" color="var(--blue)" filled className="hero__doodle hero__doodle--sparkle" />
          <Doodle shape="loop" color="var(--green)" className="hero__doodle hero__doodle--loop" />

          <Reveal className="hero__copy">
            <p className="eyebrow">{product.name}</p>
            <h1 id="hero-title" className="hero__title">
              Leur imagination n’a jamais été aussi <span className="highlight">lumineuse</span>.
            </h1>
            <p className="lede hero__lede">
              Une plaque d’acrylique, des feutres et une base LED : ils dessinent, la lumière révèle, on efface et on
              recommence.
            </p>
            <div className="hero__actions">
              <a className="btn btn--primary" href={site.primaryCta.href}>
                {site.primaryCta.label}
              </a>
              <a className="btn btn--light" href="#demonstration">
                Voir la démo
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

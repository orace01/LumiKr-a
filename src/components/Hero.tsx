import { useRef } from 'react'
import shotFusee from '../assets/media/shot-fusee.webp'
import shotNoel from '../assets/media/shot-noel.webp'
import shotNouvelAn from '../assets/media/shot-nouvel-an.webp'
import shotSirene from '../assets/media/shot-sirene.webp'
import { product } from '../config/product'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { Doodle } from './Doodle'
import { HeroVideo } from './HeroVideo'
import './Hero.css'

// Photos qui surgissent autour de la vidéo une fois refermée : le produit
// entier, un visuel fournisseur par format.
const SHOTS = [
  {
    id: 'fusee',
    variantId: '12x12',
    src: shotFusee,
    width: 796,
    height: 784,
    alt: 'Le tableau carré avec une fusée et des planètes dessinées, éclairé par sa base.',
  },
  {
    id: 'nouvel-an',
    variantId: '30x20',
    src: shotNouvelAn,
    width: 1080,
    height: 744,
    alt: 'Le tableau paysage avec des fanions et « Happy New Year » écrits aux feutres.',
  },
  {
    id: 'noel',
    variantId: '15x15',
    src: shotNoel,
    width: 800,
    height: 800,
    alt: 'Le tableau carré avec un père Noël, des cadeaux et des flocons dessinés.',
  },
  {
    id: 'sirene',
    variantId: '20x20',
    src: shotSirene,
    width: 744,
    height: 744,
    alt: 'Le tableau carré avec une sirène dessinée, allumé dans une pièce sombre.',
  },
]

const formatLabel = (variantId: string) => product.variants.find((variant) => variant.id === variantId)?.label

export function Hero() {
  const pinRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  useScrollProgress(pinRef, reducedMotion)

  return (
    <section id="accueil" className="hero" aria-label="Le tableau lumineux en vidéo et en photos">
      {/* La vidéo seule, plein écran. Elle reste épinglée pendant le défilement,
          se referme en pastille, puis les photos surgissent autour. Le titre et
          les boutons suivent dans Intro. */}
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

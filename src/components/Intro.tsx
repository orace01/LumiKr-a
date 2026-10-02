import { useRef } from 'react'
import glow from '../assets/media/hero-poster.webp'
import stillFeutres from '../assets/media/still-feutres.webp'
import stillGeste from '../assets/media/still-geste.webp'
import { product } from '../config/product'
import { site } from '../config/site'
import { useIsMobile } from '../hooks/useIsMobile'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { Doodle } from './Doodle'
import { FormatCarousel } from './FormatCarousel'
import { Reveal } from './Reveal'
import './Intro.css'

const STEPS = [
  {
    color: 'var(--glow)',
    title: 'Dessinez',
    text: 'Un prénom, un animal, un mot doux : les feutres de couleur glissent sur la plaque transparente.',
    image: stillGeste,
    width: 864,
    height: 864,
    alt: 'Une main trace un motif jaune au feutre sur le tableau éclairé, à côté d’un bonhomme de neige et de sapins dessinés.',
  },
  {
    color: 'var(--pink)',
    title: 'La lumière révèle',
    text: 'La base LED éclaire la plaque par le bas et fait ressortir chaque trait, même dans une pièce sombre.',
    image: glow,
    width: 1920,
    height: 864,
    alt: 'Dans le noir, les lettres multicolores, les sapins et le bonhomme de neige brillent sur le tableau.',
  },
  {
    color: 'var(--green)',
    title: 'Effacez, recommencez',
    text: 'La surface est effaçable : le tableau change aussi souvent que les idées.',
    image: stillFeutres,
    width: 864,
    height: 864,
    alt: 'Une main tient plusieurs feutres de couleur devant le tableau illuminé.',
  },
]

/**
 * La promesse et le principe en un seul mouvement : le titre principal et ses
 * boutons restent épinglés pendant que les trois étapes montent par-dessus,
 * chacune à sa vitesse, puis les laissent réapparaître.
 *
 * Sur téléphone, c'est le premier écran du site (pas de vidéo au-dessus) : les
 * photos des quatre formats défilent du doigt entre le titre et les boutons,
 * rien n'est épinglé et les étapes suivent simplement.
 */
export function Intro() {
  const riseRef = useRef<HTMLElement>(null)
  const mobile = useIsMobile()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  useScrollProgress(riseRef, reducedMotion)

  return (
    <section ref={riseRef} id="decouvrir" className="rise" aria-labelledby="hero-title">
      <div className="rise__title">
        <Doodle shape="squiggle" color="var(--pink)" className="rise__doodle rise__doodle--squiggle" />
        <Doodle shape="sparkle" color="var(--blue)" filled className="rise__doodle rise__doodle--sparkle" />
        <Doodle shape="loop" color="var(--green)" className="rise__doodle rise__doodle--loop" />

        <Reveal className="rise__copy">
          <p className="eyebrow">{product.name}</p>
          <h1 id="hero-title" className="rise__heading">
            Leur imagination n’a jamais été aussi <span className="highlight">lumineuse</span>.
          </h1>
          <p className="lede rise__lede">
            Une plaque d’acrylique, des feutres et une base LED : ils dessinent, la lumière révèle, on efface et on
            recommence.
          </p>
          {mobile && <FormatCarousel />}
          <div className="rise__actions">
            <a className="btn btn--primary" href={site.primaryCta.href}>
              {site.primaryCta.label}
            </a>
            <a className="btn btn--light" href="#demonstration">
              Voir la démo
            </a>
          </div>
        </Reveal>
      </div>

      <div className="container rise__track">
        <h2 className="rise__steps-title">Le principe en trois étapes</h2>
        <ol className="rise__cards">
          {STEPS.map((step, index) => (
            <li key={step.title} className={`rise__card rise__card--${index + 1}`}>
              <img
                src={step.image}
                width={step.width}
                height={step.height}
                loading="lazy"
                decoding="async"
                alt={step.alt}
              />
              <div className="rise__body">
                <span className="rise__number" aria-hidden="true" style={{ background: step.color }}>
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="rise__credit">Images extraites de la vidéo du produit.</p>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import feteNouvelAnFlou from '../assets/media/fete-nouvel-an-flou.webp'
import feteNouvelAn from '../assets/media/fete-nouvel-an.webp'
import packshot from '../assets/media/packshot.webp'
import shotSireneFlou from '../assets/media/shot-sirene-flou.webp'
import shotSirene from '../assets/media/shot-sirene.webp'
import { product } from '../config/product'
import { site } from '../config/site'
import { useIsMobile } from '../hooks/useIsMobile'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { Doodle } from './Doodle'
import { FormatCarousel } from './FormatCarousel'
import { Reveal } from './Reveal'
import './Intro.css'

// Les trois étapes racontent une histoire : la sirène dessinée, puis la même
// sirène allumée dans le noir, puis la plaque effacée qui accueille tout autre
// chose, la déco du Nouvel An.
const STEPS = [
  {
    color: 'var(--glow)',
    title: 'Écrivez, dessinez',
    text: 'Un mot doux, un menu, une citrouille ou un prénom : le feutre glisse sur la plaque transparente.',
    image: packshot,
    width: 1000,
    height: 1000,
    alt: 'Une sirène, des poissons et des algues dessinés aux feutres de couleur sur la plaque transparente.',
  },
  {
    color: 'var(--pink)',
    title: 'La lumière révèle',
    text: 'La base LED éclaire la plaque par le bas et fait ressortir chaque trait, même dans une pièce sombre.',
    image: shotSirene,
    backdrop: shotSireneFlou,
    width: 748,
    height: 760,
    alt: 'La même sirène, allumée par la base dans une pièce sombre : chaque trait brille.',
  },
  {
    color: 'var(--green)',
    title: 'Effacez, recommencez',
    text: 'La surface s’efface à sec : le tableau change aussi souvent que les idées, et que les fêtes.',
    image: feteNouvelAn,
    backdrop: feteNouvelAnFlou,
    width: 880,
    height: 696,
    alt: 'Le tableau effacé puis redécoré : une guirlande de fanions et « Happy New Year ».',
  },
]

/**
 * La promesse et le principe en un seul mouvement : le titre principal et ses
 * boutons restent épinglés pendant que les trois étapes montent par-dessus,
 * chacune à sa vitesse, puis les laissent réapparaître.
 *
 * Sur téléphone, c'est le premier écran du site (pas de hero au-dessus) : les
 * photos des quatre formats défilent du doigt entre le titre et les boutons,
 * rien n'est épinglé et les étapes suivent simplement.
 */
export function Intro() {
  const riseRef = useRef<HTMLElement>(null)
  const mobile = useIsMobile()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  useScrollProgress(riseRef, reducedMotion)
  // Sur téléphone ce bloc est le premier écran : il s'affiche tout de suite, sans
  // attendre l'apparition en fondu réservée aux blocs qu'on découvre en défilant.
  const Copy = mobile ? 'div' : Reveal

  return (
    <section ref={riseRef} id="decouvrir" className="rise" aria-labelledby="hero-title">
      <div className="rise__title">
        <Doodle shape="squiggle" color="var(--pink)" className="rise__doodle rise__doodle--squiggle" />
        <Doodle shape="sparkle" color="var(--blue)" filled className="rise__doodle rise__doodle--sparkle" />
        <Doodle shape="loop" color="var(--green)" className="rise__doodle rise__doodle--loop" />

        <Copy className="rise__copy">
          <p className="eyebrow">{product.name}</p>
          <h1 id="hero-title" className="rise__heading">
            Vos idées, en pleine <span className="highlight">lumière</span>.
          </h1>
          <p className="lede rise__lede">
            Une plaque d’acrylique sur une base LED : déco de fête, mot doux, menu du jour ou dessin d’enfant, on
            l’écrit au feutre, la lumière le révèle, on efface et on recommence.
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
        </Copy>
      </div>

      <div className="container rise__track">
        <h2 className="rise__steps-title">Le principe en trois étapes</h2>
        <ol className="rise__cards">
          {STEPS.map((step, index) => (
            <li key={step.title} className={`rise__card rise__card--${index + 1}`}>
              {/* Photo entière (on voit tout le produit), la même floutée autour. */}
              <div className="rise__media">
                {step.backdrop && (
                  <img className="rise__backdrop" src={step.backdrop} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                )}
                <img
                  className="rise__photo"
                  src={step.image}
                  width={step.width}
                  height={step.height}
                  loading="lazy"
                  decoding="async"
                  alt={step.alt}
                />
              </div>
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
        <p className="rise__credit">Photos du fournisseur.</p>
      </div>
    </section>
  )
}

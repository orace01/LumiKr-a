import { useRef } from 'react'
import packshot from '../assets/media/packshot.webp'
import { site } from '../config/site'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { Doodle } from './Doodle'
import './Finale.css'

/**
 * Dernier écran avant le pied de page : un titre géant qui monte, le produit
 * qui flotte dessous et le bouton d'achat, sur un halo de couleur.
 */
export function Finale() {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  useScrollProgress(ref, reducedMotion, 'view')

  return (
    <section ref={ref} className="finale" aria-labelledby="finale-title">
      <div className="container finale__inner">
        <h2 id="finale-title" className="finale__title">
          À vous de <span className="highlight">créer</span>.
        </h2>

        <div className="finale__product">
          <Doodle shape="star" color="var(--glow)" filled className="finale__doodle finale__doodle--star" />
          <Doodle shape="sparkle" color="var(--blue)" filled className="finale__doodle finale__doodle--sparkle" />
          <Doodle shape="squiggle" color="var(--green)" className="finale__doodle finale__doodle--squiggle" />
          <img
            src={packshot}
            width={1000}
            height={1000}
            loading="lazy"
            decoding="async"
            alt="Le tableau lumineux sur sa base, avec un dessin de sirène aux feutres de couleur."
          />
        </div>

        <a className="btn btn--primary finale__cta" href={site.primaryCta.href}>
          {site.primaryCta.label}
        </a>
      </div>
    </section>
  )
}

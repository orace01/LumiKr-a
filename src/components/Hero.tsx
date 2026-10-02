import { product } from '../config/product'
import { site } from '../config/site'
import { Doodle } from './Doodle'
import { HeroVideo } from './HeroVideo'
import { Reveal } from './Reveal'
import './Hero.css'

export function Hero() {
  return (
    <section id="accueil" className="hero" aria-labelledby="hero-title">
      {/* Écran 1 : la vidéo seule, plein écran, sans texte par-dessus. */}
      <div className="hero__stage on-night">
        <HeroVideo />
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

      {/* Écran 2 : la promesse et les actions, sur fond clair. */}
      <div id="decouvrir" className="hero__intro">
        <div className="container hero__intro-inner">
          <Doodle shape="star" color="var(--glow)" filled className="hero__doodle hero__doodle--star" />
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

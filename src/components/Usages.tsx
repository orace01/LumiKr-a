import { useEffect, useRef, useState, type CSSProperties } from 'react'
import bonjourLarge from '../assets/media/bonjour-large.webp'
import packshot from '../assets/media/packshot.webp'
import shotFleurs from '../assets/media/shot-fleurs.webp'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import './Usages.css'

const USAGES = [
  {
    id: 'creer',
    tag: 'Créer',
    tagClass: 'eyebrow',
    title: 'Un dessin aujourd’hui, un autre demain.',
    text: 'Sirène, fusée ou prénom en couleurs : la plaque se remplit, s’illumine, puis repart de zéro pour l’idée suivante.',
    image: packshot,
    width: 1000,
    height: 1000,
    alt: 'Le tableau carré sur sa base lumineuse, avec une sirène, des poissons et des algues dessinés aux feutres de couleur.',
  },
  {
    id: 'decorer',
    tag: 'Décorer',
    tagClass: 'eyebrow eyebrow--orange',
    title: 'Une déco qui change avec vos envies.',
    text: 'Sur un bureau ou une étagère, le tableau affiche le motif du moment : une saison, une fête, une humeur.',
    image: shotFleurs,
    width: 1240,
    height: 976,
    alt: 'Le tableau posé sur un bureau, décoré d’une guirlande de fleurs multicolores, éclairé par sa base.',
  },
  {
    id: 'annoncer',
    tag: 'Annoncer',
    tagClass: 'eyebrow eyebrow--green',
    title: 'Votre message, visible même dans le noir.',
    text: 'Menu du jour, mot d’accueil, suggestion du soir : au comptoir d’un bar ou d’une boutique, le message s’éclaire et se réécrit quand vous voulez.',
    image: bonjourLarge,
    width: 1000,
    height: 436,
    alt: 'Le tableau paysage allumé sur un bureau, avec « Good Morning » écrit en jaune et une fleur rouge.',
  },
]

export function Usages() {
  const cardsRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  useScrollProgress(cardsRef, reducedMotion)

  // L'usage « actif » est la carte du dessus : comme les cartes empilées restent
  // toutes à l'écran, c'est la dernière de celles qui croisent le milieu.
  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll('.stack__card')
    if (!cards) return

    const atCenter = new Set<number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index)
          if (entry.isIntersecting) atCenter.add(index)
          else atCenter.delete(index)
        }
        if (atCenter.size) setActive(Math.max(...atCenter))
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="usages" className="stack" aria-labelledby="usages-title">
      <div className="container stack__layout">
        {/* Colonne fixe : le titre et le sommaire restent en place pendant que
            les cartes défilent et s'empilent à droite. */}
        <div className="stack__aside">
          <div className="stack__heading">
            <p className="eyebrow">Usages</p>
            <h2 id="usages-title" className="section-title">
              Un tableau, <span className="highlight highlight--pink">trois façons</span> de s’en servir.
            </h2>
          </div>
          <nav className="stack__nav" aria-label="Les trois usages">
            <ol>
              {USAGES.map((usage, index) => (
                <li key={usage.id}>
                  <a
                    href={`#usage-${usage.id}`}
                    className={index === active ? 'is-active' : undefined}
                    aria-current={index === active ? 'true' : undefined}
                  >
                    {usage.tag}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div ref={cardsRef} className="stack__cards" style={{ '--count': USAGES.length } as CSSProperties}>
          {USAGES.map((usage, index) => (
            <article
              key={usage.id}
              id={`usage-${usage.id}`}
              className={`stack__card stack__card--${usage.id}`}
              data-index={index}
              style={{ '--i': index } as CSSProperties}
            >
              <div className="stack__media">
                <img
                  src={usage.image}
                  width={usage.width}
                  height={usage.height}
                  loading="lazy"
                  decoding="async"
                  alt={usage.alt}
                />
              </div>
              <div className="stack__body">
                <p className={usage.tagClass}>{usage.tag}</p>
                <h3>{usage.title}</h3>
                <p>{usage.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

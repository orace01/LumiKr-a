import { useEffect, useRef, useState, type CSSProperties } from 'react'
import decoVeilleuseFlou from '../assets/media/deco-veilleuse-flou.webp'
import decoVeilleuse from '../assets/media/deco-veilleuse.webp'
import feteHalloweenFlou from '../assets/media/fete-halloween-flou.webp'
import feteHalloween from '../assets/media/fete-halloween.webp'
import messageBonjourFlou from '../assets/media/message-bonjour-flou.webp'
import messageBonjour from '../assets/media/message-bonjour.webp'
import creerFuseeFlou from '../assets/media/creer-fusee-flou.webp'
import creerFusee from '../assets/media/creer-fusee.webp'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import './Usages.css'

// Du plus large au plus ciblé : la déco de fête et de maison d'abord, les
// dessins d'enfants en dernier (choix du 2026-10-09 : ne plus présenter le
// tableau comme un jouet seulement). Une seule photo par carte, toujours
// montrée en entière pour qu'on voie tout le produit ; `backdrop`, la même photo
// floutée, remplit le cadre autour.
const USAGES: {
  id: string
  tag: string
  tagClass: string
  title: string
  text: string
  image: string
  backdrop?: string
  width: number
  height: number
  alt: string
}[] = [
  {
    id: 'feter',
    tag: 'Fêter',
    tagClass: 'eyebrow eyebrow--orange',
    title: 'Une déco pour chaque fête.',
    text: 'Citrouille pour Halloween, sapin à Noël, guirlande au Nouvel An : on efface la plaque et on dessine la fête suivante.',
    image: feteHalloween,
    backdrop: feteHalloweenFlou,
    width: 2048,
    height: 1144,
    alt: 'Le tableau allumé dans une pièce sombre, décoré pour Halloween : toiles d’araignée, citrouille, chauves-souris et « Spooky Evening ».',
  },
  {
    id: 'decorer',
    tag: 'Décorer',
    tagClass: 'eyebrow eyebrow--violet',
    title: 'Une lumière douce dans la maison.',
    text: 'Sur une étagère, une commode ou une table de chevet, la plaque éclairée par sa base décore le jour et fait veilleuse le soir.',
    image: decoVeilleuse,
    backdrop: decoVeilleuseFlou,
    width: 682,
    height: 620,
    alt: 'Le tableau allumé sur une commode, décoré de « Merry Christmas », de sapins, de flocons et d’un bonhomme de neige.',
  },
  {
    id: 'ecrire',
    tag: 'Écrire',
    tagClass: 'eyebrow eyebrow--green',
    title: 'Un message qui se voit, même dans le noir.',
    text: 'Mot du matin, citation, liste de la semaine… ou, au comptoir d’un café ou d’une boutique, le menu du jour et l’offre du moment : on l’écrit, il s’illumine, on le change quand on veut.',
    image: messageBonjour,
    backdrop: messageBonjourFlou,
    width: 920,
    height: 650,
    alt: 'Le tableau paysage allumé sur un bureau, avec une citation en couleurs, « Good Morning » écrit en jaune et une fleur rouge.',
  },
  {
    id: 'creer',
    tag: 'Créer',
    tagClass: 'eyebrow',
    title: 'Et pour les enfants, une ardoise qui brille.',
    text: 'Sirène, fusée ou prénom en couleurs : la plaque se remplit, s’illumine, puis repart de zéro pour le dessin suivant.',
    image: creerFusee,
    backdrop: creerFuseeFlou,
    width: 880,
    height: 880,
    alt: 'Le petit tableau carré allumé dans une pièce sombre, avec une fusée, des planètes et des étoiles dessinées en couleurs.',
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
              Un tableau, <span className="highlight highlight--pink">mille façons</span> de s’en servir.
            </h2>
          </div>
          <nav className="stack__nav" aria-label="Les usages">
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
              <div className="stack__media" style={{ '--ratio': `${usage.width} / ${usage.height}` } as CSSProperties}>
                {usage.backdrop && (
                  <img className="stack__backdrop" src={usage.backdrop} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                )}
                <img
                  className="stack__photo"
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

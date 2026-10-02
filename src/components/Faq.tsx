import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { faq } from '../config/faq'
import { product } from '../config/product'
import { Reveal } from './Reveal'
import { ToConfirm } from './ToConfirm'
import './Faq.css'

// Une couleur de feutre par question. Le blanc est écarté : c'est la couleur
// du texte des réponses.
const PENS = product.penColors.filter((pen) => pen.name !== 'Blanc')
const penFor = (index: number) => PENS[index % PENS.length].hex

const KEY_STEPS: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }

// Espace insécable avant le point d'interrogation : il ne part jamais seul à la ligne.
const tidy = (question: string) => question.replace(/ \?$/, '\u00a0?')

/** Découpe un texte en mots, pour les faire apparaître un à un comme s'ils étaient écrits. */
function Words({ text }: { text: string }) {
  return text.split(' ').map((word, index) => (
    // Le texte ne change jamais : l'index suffit comme clé.
    <span key={index} className="faq-board__word" style={{ '--w': index } as CSSProperties}>
      {word}{' '}
    </span>
  ))
}

/**
 * Les questions sont des onglets ; la réponse s'écrit en néon sur un tableau
 * lumineux, dans la couleur de feutre de la question.
 */
export function Faq() {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  // Navigation clavier d'une liste d'onglets : flèches, Début, Fin.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number
    if (event.key in KEY_STEPS) next = (active + KEY_STEPS[event.key] + faq.length) % faq.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = faq.length - 1
    else return

    event.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <section id="questions" className="section faq" aria-labelledby="faq-title">
      <div className="container faq__layout">
        <Reveal className="faq__heading">
          <p className="eyebrow eyebrow--green">Questions</p>
          <h2 id="faq-title" className="section-title">
            Avant de vous lancer.
          </h2>
        </Reveal>

        <div
          className="faq__tabs"
          role="tablist"
          aria-labelledby="faq-title"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
        >
          {faq.map((entry, index) => (
            <button
              key={entry.question}
              ref={(node) => {
                tabs.current[index] = node
              }}
              type="button"
              role="tab"
              id={`faq-tab-${index}`}
              className="faq__tab"
              aria-selected={index === active}
              aria-controls={`faq-panel-${index}`}
              tabIndex={index === active ? 0 : -1}
              style={{ '--pen': penFor(index) } as CSSProperties}
              onClick={() => setActive(index)}
            >
              <span className="faq__dot" aria-hidden="true" />
              {tidy(entry.question)}
            </button>
          ))}
        </div>

        <Reveal className="faq__board" delay={120}>
          <div className="faq-board" style={{ '--pen': penFor(active) } as CSSProperties}>
            <p className="faq-board__count" aria-hidden="true">
              {active + 1} / {faq.length}
            </p>
            <div className="faq-board__plate">
              {faq.map((entry, index) => (
                <div
                  key={entry.question}
                  role="tabpanel"
                  id={`faq-panel-${index}`}
                  aria-labelledby={`faq-tab-${index}`}
                  className={`faq-board__panel${index === active ? ' is-active' : ''}`}
                >
                  <p className="faq-board__question">{tidy(entry.question)}</p>
                  <svg className="faq-board__underline" viewBox="0 0 200 12" aria-hidden="true" focusable="false">
                    <path d="M3 8c16-8 32 6 48 0s32-6 48 0 32 6 48 0 32-6 50 0" pathLength={1} />
                  </svg>
                  {entry.answer && (
                    <p className="faq-board__answer">
                      <Words text={entry.answer} />
                    </p>
                  )}
                  {entry.pending && (
                    <p className="faq-board__pending">
                      {entry.pending} <ToConfirm />
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="faq-board__base" aria-hidden="true" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

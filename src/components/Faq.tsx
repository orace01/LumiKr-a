import { faq } from '../config/faq'
import { Reveal } from './Reveal'
import { ToConfirm } from './ToConfirm'
import './Faq.css'

export function Faq() {
  return (
    <section id="questions" className="section faq" aria-labelledby="faq-title">
      <div className="container faq__layout">
        <Reveal className="faq__heading">
          <p className="eyebrow eyebrow--green">Questions</p>
          <h2 id="faq-title" className="section-title">
            Avant de vous lancer.
          </h2>
        </Reveal>

        <Reveal className="faq__list" delay={120}>
          {faq.map((entry) => (
            <details key={entry.question} className="faq__item">
              <summary>
                <span>{entry.question}</span>
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </summary>
              <div className="faq__answer">
                {entry.answer && <p>{entry.answer}</p>}
                {entry.pending && (
                  <p className="faq__pending">
                    {entry.pending} <ToConfirm />
                  </p>
                )}
              </div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

import type { CustomerStatus, PublicOrder } from '../shop/types'
import './OrderTimeline.css'

const STEPS: { status: CustomerStatus; title: string; text: string }[] = [
  { status: 'confirmed', title: 'Commande confirmée', text: 'Votre paiement est accepté.' },
  { status: 'preparing', title: 'En préparation', text: 'Votre tableau est préparé pour l’expédition.' },
  { status: 'shipped', title: 'Expédiée', text: 'Le colis est confié au transporteur.' },
  { status: 'delivered', title: 'Livrée', text: 'Le colis est arrivé à destination.' },
]

const ORDER: CustomerStatus[] = STEPS.map((step) => step.status)

/** Les quatre étapes d'une commande payée, avec la date de chacune. */
export function OrderTimeline({ order, locale }: { order: PublicOrder; locale: string }) {
  const reached = ORDER.indexOf(order.status)
  const date = (iso: string | undefined) =>
    iso ? new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso)) : null

  return (
    <ol className="timeline">
      {STEPS.map((step, index) => {
        const state = index < reached ? 'done' : index === reached ? 'current' : 'todo'
        const at = date(order.steps[step.status])
        return (
          <li key={step.status} className={`timeline__step timeline__step--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="timeline__dot" aria-hidden="true">
              {state === 'done' ? (
                <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
                  <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            <div className="timeline__body">
              <p className="timeline__title">
                {step.title}
                {state === 'todo' && <span className="visually-hidden"> (à venir)</span>}
              </p>
              <p className="timeline__text">{at ? `${step.text} ${at}.` : step.text}</p>
              {step.status === 'shipped' && order.tracking && reached >= index && (
                <p className="timeline__tracking">
                  {order.tracking.carrier && <>Transporteur : {order.tracking.carrier}. </>}
                  {order.tracking.trackingNumber && <>Numéro de suivi : <strong>{order.tracking.trackingNumber}</strong>. </>}
                  {order.tracking.trackingUrl && (
                    <a href={order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer">
                      Suivre le colis chez le transporteur
                    </a>
                  )}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

import { useRef, useState, type FormEvent } from 'react'
import { Field } from '../components/Field'
import { OrderSummary } from '../components/OrderSummary'
import { OrderTimeline } from '../components/OrderTimeline'
import { shop } from '../config/shop'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Link } from '../components/Link'
import { useLocation } from '../router'
import { api, ApiError } from '../shop/api'
import { useShop } from '../shop/useShop'
import type { PublicOrder } from '../shop/types'
import './OrderPages.css'

const STATUS_TEXT: Record<PublicOrder['status'], string> = {
  awaiting_payment: 'Paiement en attente de confirmation.',
  payment_failed: 'Le paiement n’a pas abouti : cette commande n’a pas été validée.',
  cancelled: 'Le paiement a été annulé : cette commande n’a pas été validée.',
  confirmed: 'Commande confirmée.',
  preparing: 'Commande en préparation.',
  shipped: 'Commande expédiée.',
  delivered: 'Commande livrée.',
}

export function TrackingPage() {
  useDocumentTitle('Suivre ma commande')
  const { search } = useLocation()
  const { money } = useShop()
  const [orderId, setOrderId] = useState(() => new URLSearchParams(search).get('commande') ?? '')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<PublicOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!orderId.trim() || !email.trim()) {
      setError('Indiquez le numéro de commande et l’adresse e-mail utilisée pour commander.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      setOrder(await api.lookup(orderId.trim(), email.trim()))
      requestAnimationFrame(() => resultRef.current?.focus())
    } catch (caught) {
      setOrder(null)
      setError(caught instanceof ApiError ? caught.message : 'Une erreur est survenue. Réessayez dans quelques instants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container order-page">
      <header className="order-page__intro">
        <p className="eyebrow eyebrow--blue">Ma commande</p>
        <h1 className="order-page__title">Où en est mon colis ?</h1>
      </header>

      <div className="order-page__grid order-page__grid--tracking">
        <form className="order-page__card order-page__form" noValidate onSubmit={onSubmit}>
          <Field
            name="orderId"
            label="Numéro de commande"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="LK-XXXXXX"
            autoCapitalize="characters"
            spellCheck={false}
            hint="Il figure sur la page de confirmation de votre commande."
          />
          <Field
            name="email"
            label="Adresse e-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error && (
            <p className="field__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn--primary" disabled={loading} aria-busy={loading}>
            {loading ? 'Recherche…' : 'Suivre ma commande'}
          </button>
        </form>

        {order ? (
          <div ref={resultRef} className="order-page__card" tabIndex={-1} aria-labelledby="resultat">
            <h2 id="resultat" className="order-page__subtitle">
              Commande {order.id}
            </h2>
            <p className="order-page__status">{STATUS_TEXT[order.status]}</p>
            {['confirmed', 'preparing', 'shipped', 'delivered'].includes(order.status) && (
              <OrderTimeline order={order} locale={shop.locale} />
            )}
            {(order.status === 'payment_failed' || order.status === 'cancelled') && (
              <Link to="/#formats" className="btn btn--light">
                Repasser commande
              </Link>
            )}
            <OrderSummary
              lines={order.lines}
              subtotalCents={order.subtotalCents}
              shippingCents={order.shippingCents}
              totalCents={order.totalCents}
              shippingLabel={order.shippingMethodLabel}
              money={money}
            />
          </div>
        ) : (
          <div className="order-page__card order-page__help">
            <h2 className="order-page__subtitle">Une question ?</h2>
            <p>
              Le numéro de commande commence par « LK- ». Il s’affiche sur la page de confirmation, juste après le
              paiement.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

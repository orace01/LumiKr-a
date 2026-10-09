import { useEffect, useRef, useState } from 'react'
import { OrderSummary } from '../components/OrderSummary'
import { OrderTimeline } from '../components/OrderTimeline'
import { shop } from '../config/shop'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Link } from '../components/Link'
import { navigate, useLocation } from '../router'
import { api, ApiError } from '../shop/api'
import { useCart } from '../shop/useCart'
import { clearCheckoutDraft } from '../shop/checkoutDraft'
import { clearPendingOrder, loadPendingOrder } from '../shop/pendingOrder'
import { useShop } from '../shop/useShop'
import type { PublicOrder } from '../shop/types'
import './OrderPages.css'

// Le client revient parfois avant que le prestataire ait confirmé le paiement :
// la page redemande l'état toutes les 3 secondes, pendant une minute.
const POLL_MS = 3000
const POLL_MAX = 20

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; order: PublicOrder; polls: number }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string }

const PAID = new Set(['confirmed', 'preparing', 'shipped', 'delivered'])

export function ConfirmationPage() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const orderId = params.get('commande') ?? ''
  const key = params.get('cle') ?? ''
  const cart = useCart()
  const { money } = useShop()
  const [loaded, setState] = useState<State>({ kind: 'loading' })
  const cleared = useRef(false)
  // Retour du prestataire sans numéro de commande (Mepaye ramène sur une
  // adresse fixe) : la commande en cours de paiement gardée par le navigateur.
  const pending = orderId && key ? null : loadPendingOrder()
  // Un lien sans numéro ou sans clé ne mène à aucune commande.
  const state: State = orderId && key ? loaded : pending ? { kind: 'loading' } : { kind: 'not-found' }

  useEffect(() => {
    if (pending) navigate(pending, { replace: true })
  }, [pending])

  const order = state.kind === 'ready' ? state.order : null
  const paid = order !== null && PAID.has(order.status)
  useDocumentTitle(paid ? 'Commande confirmée' : 'Votre commande')

  useEffect(() => {
    if (!orderId || !key) return
    let cancelled = false
    let timer = 0
    const load = async (polls: number) => {
      try {
        const next = await api.order(orderId, key)
        if (cancelled) return
        setState({ kind: 'ready', order: next, polls })
        if (next.status === 'awaiting_payment' && polls < POLL_MAX) {
          timer = window.setTimeout(() => load(polls + 1), POLL_MS)
        }
      } catch (error) {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 404) setState({ kind: 'not-found' })
        else setState({ kind: 'error', message: error instanceof Error ? error.message : 'Erreur inconnue.' })
      }
    }
    load(0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [orderId, key])

  // Paiement confirmé : le panier et le formulaire ont fait leur office.
  useEffect(() => {
    if (paid && !cleared.current) {
      cleared.current = true
      cart.clear()
      clearCheckoutDraft()
      clearPendingOrder()
    }
  }, [paid, cart])

  if (state.kind === 'loading') {
    return (
      <section className="container order-page order-page--center" aria-busy="true">
        <span className="order-page__spinner" aria-hidden="true" />
        <p>Chargement de votre commande…</p>
      </section>
    )
  }

  if (state.kind === 'not-found' || state.kind === 'error') {
    return (
      <section className="container order-page order-page--center">
        <h1 className="order-page__title">{state.kind === 'error' ? 'Commande momentanément indisponible' : 'Commande introuvable'}</h1>
        <p className="lede">
          {state.kind === 'error'
            ? state.message
            : 'Ce lien de confirmation n’est pas valide. Retrouvez votre commande avec son numéro et votre adresse e-mail.'}
        </p>
        <Link to="/suivi" className="btn btn--primary">
          Suivre une commande
        </Link>
      </section>
    )
  }

  const current = state.order

  if (current.status === 'awaiting_payment') {
    const gaveUp = state.polls >= POLL_MAX
    return (
      <section className="container order-page order-page--center" aria-live="polite">
        {!gaveUp && <span className="order-page__spinner" aria-hidden="true" />}
        <h1 className="order-page__title">{gaveUp ? 'Confirmation en attente' : 'Vérification du paiement…'}</h1>
        <p className="lede">
          {gaveUp
            ? `Nous n’avons pas encore reçu la confirmation de votre paiement. Si vous avez été débité, la commande ${current.id} sera validée automatiquement : vous pourrez suivre son état sur la page de suivi.`
            : `Commande ${current.id}. Nous attendons la confirmation de votre paiement, cela prend quelques secondes.`}
        </p>
        {gaveUp && (
          <Link to={`/suivi?commande=${encodeURIComponent(current.id)}`} className="btn btn--primary">
            Suivre ma commande
          </Link>
        )}
      </section>
    )
  }

  if (current.status === 'payment_failed' || current.status === 'cancelled') {
    return (
      <section className="container order-page order-page--center">
        <h1 className="order-page__title">Le paiement n’a pas abouti</h1>
        <p className="lede">
          Rien n’a été débité. Votre panier est conservé : vous pouvez réessayer, avec le même moyen de paiement ou un
          autre.
        </p>
        <Link to="/commande" className="btn btn--primary">
          Réessayer le paiement
        </Link>
      </section>
    )
  }

  return (
    <div className="container order-page">
      <header className="order-page__hero">
        <span className="order-page__check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="40" height="40" focusable="false">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="order-page__title">
          Merci, c’est <span className="highlight">commandé</span> !
        </h1>
        <p className="lede">
          Commande n° <strong className="order-page__number">{current.id}</strong>. Notez ce numéro : avec votre
          adresse e-mail ({current.email}), il permet de suivre la commande à tout moment.
        </p>
      </header>

      <div className="order-page__grid">
        <section className="order-page__card" aria-labelledby="etapes">
          <h2 id="etapes" className="order-page__subtitle">
            Et maintenant ?
          </h2>
          <OrderTimeline order={current} locale={shop.locale} />
        </section>

        <section className="order-page__card" aria-labelledby="recap">
          <h2 id="recap" className="order-page__subtitle">
            Votre commande
          </h2>
          <OrderSummary
            lines={current.lines}
            subtotalCents={current.subtotalCents}
            shippingCents={current.shippingCents}
            totalCents={current.totalCents}
            shippingLabel={current.shippingMethodLabel}
            money={money}
          />
          <div className="order-page__address">
            <p className="order-page__address-title">Livraison à</p>
            <p>
              {current.deliverTo.name}
              <br />
              {current.deliverTo.address1}
              {current.deliverTo.address2 && (
                <>
                  <br />
                  {current.deliverTo.address2}
                </>
              )}
              <br />
              {current.deliverTo.postalCode} {current.deliverTo.city}
              {current.deliverTo.region && `, ${current.deliverTo.region}`}
              <br />
              {shop.countries.find((country) => country.code === current.deliverTo.country)?.name ?? current.deliverTo.country}
            </p>
          </div>
        </section>
      </div>

      <div className="order-page__actions">
        <Link to={`/suivi?commande=${encodeURIComponent(current.id)}`} className="btn btn--primary">
          Suivre ma commande
        </Link>
        <Link to="/" className="btn btn--light">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  )
}

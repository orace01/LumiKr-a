import { useEffect, useState } from 'react'
import { Link } from '../components/Link'
import { shop } from '../config/shop'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useLocation } from '../router'
import { api } from '../shop/api'
import { formatMoney } from '../shop/money'
import './OrderPages.css'

type Session = { orderId: string; amountCents: number; currency: string }

/**
 * Page de paiement SIMULÉE, utilisée en mode démo à la place de celle du
 * prestataire. En mode réel, le client est envoyé sur le site du prestataire et
 * cette page n'a plus de session à afficher.
 */
export function DemoPaymentPage() {
  useDocumentTitle('Paiement simulé')
  const { search } = useLocation()
  const reference = new URLSearchParams(search).get('ref') ?? ''
  const [session, setSession] = useState<Session | null>(null)
  const [failed, setFailed] = useState(false)
  const [sending, setSending] = useState(false)
  const missing = !reference || failed

  useEffect(() => {
    if (!reference) return
    api
      .demoPayment(reference)
      .then(setSession)
      .catch(() => setFailed(true))
  }, [reference])

  const finish = async (outcome: 'paid' | 'failed' | 'cancelled') => {
    setSending(true)
    try {
      const { redirectUrl } = await api.completeDemoPayment(reference, outcome)
      window.location.assign(redirectUrl)
    } catch {
      setSending(false)
      setFailed(true)
    }
  }

  if (missing) {
    return (
      <section className="container order-page order-page--center">
        <h1 className="order-page__title">Paiement introuvable</h1>
        <p className="lede">Cette page de paiement simulée a expiré (le serveur a peut-être redémarré).</p>
        <Link to="/commande" className="btn btn--primary">
          Revenir à la commande
        </Link>
      </section>
    )
  }

  return (
    <section className="container order-page order-page--center demo-pay" aria-busy={!session}>
      <p className="demo-pay__badge">Simulation · aucun paiement réel</p>
      <h1 className="order-page__title">Prestataire de paiement</h1>
      {session ? (
        <>
          <p className="demo-pay__amount">
            {formatMoney(session.amountCents, session.currency, shop.locale)}
            <span>Commande {session.orderId}</span>
          </p>
          <p className="lede">
            En mode réel, cette étape se passe sur la page sécurisée de l’agrégateur de paiement. Choisissez l’issue
            à simuler :
          </p>
          <div className="demo-pay__actions">
            <button type="button" className="btn btn--primary" disabled={sending} onClick={() => finish('paid')}>
              Paiement accepté
            </button>
            <button type="button" className="btn btn--light" disabled={sending} onClick={() => finish('failed')}>
              Paiement refusé
            </button>
            <button type="button" className="btn btn--light" disabled={sending} onClick={() => finish('cancelled')}>
              Le client abandonne
            </button>
          </div>
        </>
      ) : (
        <span className="order-page__spinner" aria-hidden="true" />
      )}
    </section>
  )
}

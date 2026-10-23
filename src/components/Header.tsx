import { site } from '../config/site'
import { Link } from './Link'
import { useCart } from '../shop/useCart'
import './Header.css'

/** Logo de l'accueil (frontend2/media/logo.svg, servi à /media/logo.svg). */
function Logo() {
  return <img className="header__logo" src="/media/logo.svg" alt={site.brand} width={140} height={40} />
}

function CartButton() {
  const cart = useCart()
  const label = cart.count === 0 ? 'Panier, vide' : `Panier, ${cart.count} article${cart.count > 1 ? 's' : ''}`
  return (
    <button type="button" className="header__cart" onClick={cart.open} aria-label={label}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path
          d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8zM9 8V6.5a3 3 0 0 1 6 0V8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {cart.count > 0 && (
        <span className="header__cart-count" aria-hidden="true">
          {cart.count}
        </span>
      )}
    </button>
  )
}

/** En-tête des pages de la boutique ; l'accueil (frontend2/) a le sien. */
export function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link className="header__brand" to="/" aria-label={`${site.brand}, accueil`}>
          <Logo />
        </Link>

        <nav className="header__nav" aria-label="Sections de la page d’accueil">
          <ul>
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link to={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <CartButton />
          <Link className="btn btn--primary btn--small header__cta" to={site.primaryCta.href}>
            {site.primaryCta.label}
          </Link>
        </div>
      </div>
    </header>
  )
}

/** En-tête réduit de la page de commande : pas de menu, pour ne pas distraire. */
export function CheckoutHeader() {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link className="header__brand" to="/" aria-label={`${site.brand}, retour à l’accueil`}>
          <Logo />
        </Link>
        <p className="header__secure">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Paiement sécurisé
        </p>
      </div>
    </header>
  )
}

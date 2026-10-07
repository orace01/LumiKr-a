import { useEffect, useState } from 'react'
import { site } from '../config/site'
import { useIsMobile } from '../hooks/useIsMobile'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { Link } from './Link'
import { useCart } from '../shop/useCart'
import './Header.css'

function BrandMark() {
  return (
    <svg className="header__mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M32 4c1.9 16.5 7.6 22.2 24 24-16.4 1.8-22.1 7.5-24 24-1.9-16.5-7.6-22.2-24-24 16.4-1.8 22.1-7.5 24-24z" />
    </svg>
  )
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

/**
 * En-tête du site. Sur l'accueil (`overHero`), il est transparent tant qu'il
 * est posé sur la photo plein écran, puis reprend son fond clair dès qu'on
 * défile. Il n'y a pas de photo plein écran sur téléphone, et avec les
 * animations réduites elle s'affiche déjà resserrée.
 */
export function Header({ overHero = false }: { overHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const mobile = useIsMobile()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const transparent = overHero && !scrolled && !mobile && !reducedMotion

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header${transparent ? ' header--over' : ''}`}>
      <div className="container header__inner">
        <Link className="header__brand" to="/" aria-label={`${site.brand}, accueil`}>
          <BrandMark />
          {site.brand}
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
          <BrandMark />
          {site.brand}
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

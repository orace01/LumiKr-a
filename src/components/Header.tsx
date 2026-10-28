import { useEffect, useState } from 'react'
import { site } from '../config/site'
import { Link } from './Link'
import { useCart } from '../shop/useCart'
import { useCartBump } from '../shop/useCartBump'
import './Header.css'

/** Logo de l'accueil (frontend2/media/logo.svg, servi à /media/logo.svg). */
function Logo() {
  return <img className="header__logo" src="/media/logo.svg" alt={site.brand} width={140} height={40} />
}

function CartButton() {
  const cart = useCart()
  const bump = useCartBump()
  const label = cart.count === 0 ? 'Panier, vide' : `Panier, ${cart.count} article${cart.count > 1 ? 's' : ''}`
  return (
    // Cible de la photo qui vole jusqu'au panier sur ordinateur (src/shop/cartEffects.ts).
    <button type="button" className="header__cart" onClick={cart.open} aria-label={label} data-cart-target>
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
        <span className={`header__cart-count ${bump.className}`} aria-hidden="true" onAnimationEnd={bump.onAnimationEnd}>
          {cart.count}
        </span>
      )}
    </button>
  )
}

/** Vrai dès que la page a défilé : l'en-tête devient alors transparent. */
function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return scrolled
}

// Le menu de téléphone se ferme quand l'écran passe à la largeur où le menu complet s'affiche (Header.css).
const WIDE_SCREEN = '(min-width: 900px)'

/** Téléphone : bouton menu (à la place du panier) et son panneau de liens, panier compris. */
function MobileMenu({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }) {
  const cart = useCart()
  return (
    <>
      <button
        type="button"
        className="header__burger"
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        onClick={onToggle}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
          <path
            d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <nav className="header__menu" id="menu-mobile" aria-label="Menu" hidden={!open}>
        <ul>
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link to={item.href} onClick={onClose}>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                onClose()
                cart.open()
              }}
            >
              Panier{cart.count > 0 && <span className="header__menu-count">{cart.count}</span>}
            </button>
          </li>
          <li>
            <Link to="/suivi" onClick={onClose}>
              Suivre ma commande
            </Link>
          </li>
        </ul>
      </nav>
    </>
  )
}

/**
 * En-tête des pages de la boutique ; l'accueil (frontend2/) en a une copie (frontend2/entete-pied.css).
 * `backTo` (fiche produit) : sur téléphone, l'en-tête se pose sur la photo avec un bouton retour et le menu.
 */
export function Header({ backTo }: { backTo?: string }) {
  const scrolled = useScrolled()
  const [menuOpen, setMenuOpen] = useState(false)

  // Menu ouvert : Échap le ferme, comme le passage en grand écran.
  useEffect(() => {
    if (!menuOpen) return
    const wide = window.matchMedia(WIDE_SCREEN)
    const close = () => setMenuOpen(false)
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    wide.addEventListener('change', close)
    return () => {
      window.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', close)
    }
  }, [menuOpen])

  const classes = ['header', scrolled && !menuOpen && 'header--transparent', backTo && 'header--over']
    .filter(Boolean)
    .join(' ')
  return (
    <header className={classes}>
      <div className="container header__inner">
        {backTo && (
          <Link className="header__back" to={backTo} transition aria-label="Retour à la boutique">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
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
          <MobileMenu open={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} onClose={() => setMenuOpen(false)} />
          <Link className="btn btn--primary btn--small header__cta" to={site.primaryCta.href}>
            {/* Un seul bloc de texte : le bouton espace ses éléments (gap), pas les mots. */}
            <span>
              {site.primaryCta.label}
              <span className="header__cta-suite"> {site.primaryCta.labelEnd}</span>
            </span>
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

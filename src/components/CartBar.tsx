import { VARIANT_PHOTOS } from './variantPhotos'
import { useCart } from '../shop/useCart'
import { useCartBump } from '../shop/useCartBump'
import './CartBar.css'

const MAX_THUMBS = 3

/**
 * Téléphone : barre panier noire collée en bas (vidéo épicerie). La page repose dessus
 * avec des coins arrondis ; un toucher ouvre le panier (CartDrawer, en panneau qui monte).
 * `always` : affichée même panier vide (pages de la boutique).
 */
export function CartBar({ always }: { always: boolean }) {
  const cart = useCart()
  const bump = useCartBump()
  const visible = always || cart.count > 0
  const thumbs = cart.lines.slice(0, MAX_THUMBS)
  const extra = cart.lines.length - thumbs.length

  return (
    <div className={`cart-bar${visible ? ' is-visible' : ''}`} aria-hidden={!visible} inert={!visible}>
      <button
        type="button"
        className="cart-bar__button"
        onClick={cart.open}
        aria-label={cart.count === 0 ? 'Panier, vide' : `Panier, ${cart.count} article${cart.count > 1 ? 's' : ''}`}
      >
        <span className="cart-bar__label">Panier</span>
        <span className="cart-bar__thumbs" data-cart-target>
          {thumbs.map((line) => (
            <img key={line.variantId} className="cart-bar__thumb" src={VARIANT_PHOTOS[line.variantId]} alt="" width={40} height={40} />
          ))}
          {extra > 0 && <span className="cart-bar__more">+{extra}</span>}
        </span>
        <span className={`cart-bar__count ${bump.className}`} onAnimationEnd={bump.onAnimationEnd}>
          {cart.count}
        </span>
      </button>
    </div>
  )
}

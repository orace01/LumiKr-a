import { useRef, type PointerEvent } from 'react'
import { VARIANT_PHOTOS } from './variantPhotos'
import { useCart } from '../shop/useCart'
import { useCartBump } from '../shop/useCartBump'
import './CartBar.css'

const MAX_THUMBS = 3
// Glissé vers le haut au-delà duquel la barre ouvre le panier (vidéo épicerie).
const PULL_OPEN_PX = 40

/**
 * Téléphone : barre panier noire collée en bas (vidéo épicerie), affichée dès qu'un article est
 * dans le panier. La page repose dessus avec des coins arrondis ; un toucher ou un glissé vers le
 * haut ouvre le panier (CartDrawer, en panneau qui monte).
 */
export function CartBar() {
  const cart = useCart()
  const bump = useCartBump()
  const pull = useRef<{ startY: number; opened: boolean } | null>(null)
  const visible = cart.count > 0
  const thumbs = cart.lines.slice(0, MAX_THUMBS)
  const extra = cart.lines.length - thumbs.length

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    pull.current = { startY: event.clientY, opened: false }
  }
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!pull.current || pull.current.opened) return
    if (pull.current.startY - event.clientY > PULL_OPEN_PX) {
      pull.current.opened = true
      cart.open()
    }
  }
  const onPointerEnd = () => {
    pull.current = null
  }

  return (
    <div className={`cart-bar${visible ? ' is-visible' : ''}`} aria-hidden={!visible} inert={!visible}>
      <button
        type="button"
        className="cart-bar__button"
        onClick={() => !cart.isOpen && cart.open()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        aria-label={cart.count === 0 ? 'Panier, vide' : `Panier, ${cart.count} article${cart.count > 1 ? 's' : ''}`}
      >
        <span className="cart-bar__grip" aria-hidden="true" />
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

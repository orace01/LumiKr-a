import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { product } from '../config/product'
import { Link } from './Link'
import { useCart } from '../shop/useCart'
import { useShop } from '../shop/useShop'
import { QuantityStepper } from './QuantityStepper'
import { VARIANT_PHOTOS } from './variantPhotos'
import './CartDrawer.css'

// Durée de l'animation de fermeture (CartDrawer.css, `cart-out` et `sheet-out`).
const CLOSE_MS = 280
// Glissé vers le bas au-delà duquel le panneau du téléphone se ferme.
const DRAG_CLOSE_PX = 90

/**
 * Panier : panneau latéral sur ordinateur, panneau qui monte depuis le bas sur
 * téléphone (vidéo épicerie). Une boîte de dialogue native (<dialog>) gère le
 * piège du focus, la touche Échap et l'arrière-plan inerte.
 */
export function CartDrawer() {
  const cart = useCart()
  const { info, money, priceOf, saleOpen, status } = useShop()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const drag = useRef<{ startY: number; dy: number } | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (cart.isOpen && !dialog.open) {
      setClosing(false)
      dialog.showModal()
    }
    if (!cart.isOpen && dialog.open) {
      // Le panneau glisse avant de disparaître.
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setClosing(true)
      const timer = window.setTimeout(
        () => {
          dialog.close()
          setClosing(false)
          if (panelRef.current) panelRef.current.style.transform = ''
        },
        reduced ? 0 : CLOSE_MS,
      )
      return () => window.clearTimeout(timer)
    }
  }, [cart.isOpen])

  // Téléphone : on peut tirer le panneau vers le bas pour le fermer.
  const onDragStart = (event: PointerEvent<HTMLElement>) => {
    drag.current = { startY: event.clientY, dy: 0 }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onDragMove = (event: PointerEvent<HTMLElement>) => {
    if (!drag.current || !panelRef.current) return
    drag.current.dy = Math.max(0, event.clientY - drag.current.startY)
    panelRef.current.style.transform = `translateY(${drag.current.dy}px)`
  }
  const onDragEnd = () => {
    if (!drag.current || !panelRef.current) return
    const { dy } = drag.current
    drag.current = null
    if (dy > DRAG_CLOSE_PX) cart.close()
    else panelRef.current.style.transform = ''
  }

  const lines = cart.lines.flatMap((line) => {
    const variant = product.variants.find((candidate) => candidate.id === line.variantId)
    return variant ? [{ ...line, variant, unitPrice: priceOf(line.variantId) }] : []
  })
  const allPriced = lines.every((line) => line.unitPrice !== null)
  const subtotal = lines.reduce((sum, line) => sum + (line.unitPrice ?? 0) * line.quantity, 0)
  const shipping = info?.shippingMethods.length === 1 ? info.shippingMethods[0] : null

  return (
    <dialog
      ref={dialogRef}
      className={closing ? 'cart is-closing' : 'cart'}
      aria-labelledby="cart-title"
      onClose={cart.close}
      // Échap : fermeture animée plutôt qu'immédiate.
      onCancel={(event) => {
        event.preventDefault()
        cart.close()
      }}
      // Un clic sur le fond assombri (hors du panneau) ferme le panier.
      onClick={(event) => event.target === event.currentTarget && cart.close()}
    >
      <div className="cart__panel" ref={panelRef}>
        <span
          className="cart__handle"
          aria-hidden="true"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        />
        <header className="cart__header">
          <h2 id="cart-title" className="cart__title">
            Votre panier {cart.count > 0 && <span className="cart__count">({cart.count})</span>}
          </h2>
          <button type="button" className="cart__close" onClick={cart.close} aria-label="Fermer le panier">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="cart__empty">
            <p>Votre panier est vide.</p>
            <Link to="/boutique" transition className="btn btn--primary" onClick={cart.close}>
              Voir la boutique
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart__lines">
              {lines.map((line) => (
                <li key={line.variantId} className="cart__line">
                  {VARIANT_PHOTOS[line.variantId] && (
                    <img className="cart__thumb" src={VARIANT_PHOTOS[line.variantId]} width={96} height={72} alt="" />
                  )}
                  <div className="cart__line-body">
                    <p className="cart__line-name">{product.name}</p>
                    <p className="cart__line-variant">Format {line.variant.label}</p>
                    <div className="cart__line-actions">
                      <QuantityStepper
                        size="small"
                        value={line.quantity}
                        itemLabel={line.variant.label}
                        onChange={(quantity) => cart.setQuantity(line.variantId, quantity)}
                      />
                      <button type="button" className="cart__remove" onClick={() => cart.remove(line.variantId)}>
                        Retirer
                        <span className="visually-hidden"> le format {line.variant.label}</span>
                      </button>
                    </div>
                  </div>
                  <p className="cart__line-price">
                    {line.unitPrice !== null ? money(line.unitPrice * line.quantity) : '—'}
                  </p>
                </li>
              ))}
            </ul>

            <footer className="cart__footer">
              <div className="cart__subtotal">
                <span>Sous-total</span>
                <span className="cart__subtotal-value">{allPriced && status === 'ready' ? money(subtotal) : '—'}</span>
              </div>
              <p className="cart__note">
                {shipping && shipping.priceCents !== null
                  ? `Livraison ${shipping.priceCents === 0 ? 'offerte' : `: ${money(shipping.priceCents)}`}${shipping.delay ? ` · ${shipping.delay}` : ''}. `
                  : 'Frais de livraison calculés à l’étape suivante. '}
                Prix TTC.
              </p>

              {status === 'error' && (
                <p className="cart__alert" role="alert">
                  La boutique est momentanément indisponible. Réessayez dans quelques instants.
                </p>
              )}
              {status === 'ready' && !saleOpen && (
                <p className="cart__alert">La vente en ligne ouvre bientôt : la commande n’est pas encore possible.</p>
              )}

              {saleOpen && allPriced ? (
                <Link to="/commande" className="btn btn--primary cart__checkout" onClick={cart.close}>
                  Commander
                </Link>
              ) : (
                <button type="button" className="btn btn--primary cart__checkout" disabled>
                  Commander
                </button>
              )}
              <button type="button" className="cart__continue" onClick={cart.close}>
                Continuer ma visite
              </button>
            </footer>
          </>
        )}
      </div>
    </dialog>
  )
}

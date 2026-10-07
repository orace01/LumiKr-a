import { useEffect, useRef } from 'react'
import { product } from '../config/product'
import { Link } from './Link'
import { useCart } from '../shop/useCart'
import { useShop } from '../shop/useShop'
import { QuantityStepper } from './QuantityStepper'
import { VARIANT_PHOTOS } from './variantPhotos'
import './CartDrawer.css'

/**
 * Panier en panneau latéral. Une boîte de dialogue native (<dialog>) gère le
 * piège du focus, la touche Échap et l'arrière-plan inerte.
 */
export function CartDrawer() {
  const cart = useCart()
  const { info, money, priceOf, saleOpen, status } = useShop()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (cart.isOpen && !dialog.open) dialog.showModal()
    if (!cart.isOpen && dialog.open) dialog.close()
  }, [cart.isOpen])

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
      className="cart"
      aria-labelledby="cart-title"
      onClose={cart.close}
      // Un clic sur le fond assombri (hors du panneau) ferme le panier.
      onClick={(event) => event.target === event.currentTarget && cart.close()}
    >
      <div className="cart__panel">
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
            <Link to="/#formats" className="btn btn--primary" onClick={cart.close}>
              Choisir un format
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
                  ? `Livraison : ${money(shipping.priceCents)}${shipping.delay ? ` · ${shipping.delay}` : ''}. `
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

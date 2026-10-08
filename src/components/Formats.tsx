import { useState } from 'react'
import { product } from '../config/product'
import { useCart } from '../shop/useCart'
import { useShop } from '../shop/useShop'
import { QuantityStepper } from './QuantityStepper'
import { Reveal } from './Reveal'
import { ScaleDiagram } from './ScaleDiagram'
import { ToConfirm } from './ToConfirm'
import { VARIANT_PHOTOS } from './variantPhotos'
import './Formats.css'

export function Formats() {
  const [selectedId, setSelectedId] = useState(product.defaultVariantId)
  const [quantity, setQuantity] = useState(1)
  const selected = product.variants.find((variant) => variant.id === selectedId) ?? product.variants[0]
  const cart = useCart()
  const { info, money, priceOf, saleOpen, status } = useShop()

  // Les prix viennent du serveur, qui les applique aussi à la commande.
  const price = priceOf(selected.id)
  const canAdd = saleOpen && price !== null
  const shipping = info?.shippingMethods.length === 1 ? info.shippingMethods[0] : null

  const addToCart = () => {
    cart.add(selected.id, quantity)
    setQuantity(1)
    cart.open()
  }

  return (
    <section id="formats" className="section formats" aria-labelledby="formats-title">
      <div className="container formats__layout">
        <Reveal className="formats__intro">
          <p className="eyebrow eyebrow--blue">Formats</p>
          <h2 id="formats-title" className="section-title">
            Choisissez votre format.
          </h2>
          <p className="lede">{product.shortDescription}</p>
        </Reveal>

        <Reveal className="formats__figure">
          <ScaleDiagram variants={product.variants} selectedId={selected.id} />
          <p className="formats__figure-note">
            Formats à l’échelle, comparés à une feuille A4. {!product.dimensionsVerified && <ToConfirm />}
          </p>
        </Reveal>

        <Reveal className="formats__chooser" delay={120}>
          <fieldset className="formats__options">
            <legend>Dimensions de la plaque</legend>
            {product.variants.map((variant) => (
              <label key={variant.id} className="formats__option">
                <input
                  type="radio"
                  name="format"
                  className="visually-hidden"
                  value={variant.id}
                  checked={variant.id === selected.id}
                  onChange={() => setSelectedId(variant.id)}
                />
                <span className="formats__option-card">
                  {VARIANT_PHOTOS[variant.id] && (
                    <img
                      className="formats__option-photo"
                      src={VARIANT_PHOTOS[variant.id]}
                      width={400}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      alt=""
                    />
                  )}
                  <span className="formats__option-text">
                    <span className="formats__option-label">{variant.label}</span>
                    <span className="formats__option-shape">
                      {variant.shape}
                      {priceOf(variant.id) !== null && ` · ${money(priceOf(variant.id)!)}`}
                    </span>
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="formats__buy">
            <div className="formats__price-block" aria-live="polite">
              <p className="formats__price">
                {status === 'loading' ? (
                  <span className="formats__price-label">Chargement du prix…</span>
                ) : price !== null ? (
                  money(price)
                ) : (
                  <>
                    <span className="formats__price-label">Prix du {selected.label}</span> <ToConfirm />
                  </>
                )}
              </p>
              <p className="formats__shipping">
                {shipping && shipping.priceCents !== null
                  ? `Livraison ${shipping.priceCents === 0 ? 'offerte' : money(shipping.priceCents)}${shipping.delay ? ` · ${shipping.delay}` : ''}`
                  : 'Prix TTC · livraison calculée à la commande'}
              </p>
            </div>
            <QuantityStepper value={quantity} onChange={setQuantity} itemLabel={selected.label} />
          </div>

          <button type="button" className="btn btn--primary formats__add" disabled={!canAdd} onClick={addToCart}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
              <path
                d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8zM9 8V6.5a3 3 0 0 1 6 0V8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            Ajouter au panier
          </button>

          {status === 'error' && (
            <p className="formats__notice" role="alert">
              La boutique est momentanément indisponible. Réessayez dans quelques instants.
            </p>
          )}
          {status === 'ready' && !saleOpen && (
            <p className="formats__notice">
              La vente en ligne ouvre bientôt.
              {/* Pour le propriétaire du site seulement, pendant le développement. */}
              {import.meta.env.DEV && info?.closedReason && <> ({info.closedReason})</>}
            </p>
          )}
          {saleOpen && info?.paymentProviderName && (
            <p className="formats__notice">Paiement sécurisé par {info.paymentProviderName}.</p>
          )}
        </Reveal>
      </div>
    </section>
  )
}

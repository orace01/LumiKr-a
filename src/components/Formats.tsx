import { useState } from 'react'
import photo12 from '../assets/media/format-12x12.webp'
import photo15 from '../assets/media/format-15x15.webp'
import photo20 from '../assets/media/format-20x20.webp'
import photo30 from '../assets/media/format-30x20.webp'
import { formatPrice, product } from '../config/product'
import { site } from '../config/site'
import { Reveal } from './Reveal'
import { ScaleDiagram } from './ScaleDiagram'
import { ToConfirm } from './ToConfirm'
import './Formats.css'

// Photo fournisseur de chaque format, par identifiant de variante.
const PHOTOS: Record<string, string | undefined> = {
  '12x12': photo12,
  '15x15': photo15,
  '20x20': photo20,
  '30x20': photo30,
}

export function Formats() {
  const [selectedId, setSelectedId] = useState(product.defaultVariantId)
  const selected = product.variants.find((variant) => variant.id === selectedId) ?? product.variants[0]
  const checkoutUrl = product.checkout.url
  // La commande n'est proposée que si le prix est fixé et la vente raccordée.
  const canOrder = checkoutUrl !== null && selected.price !== null

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
                  {PHOTOS[variant.id] && (
                    <img
                      className="formats__option-photo"
                      src={PHOTOS[variant.id]}
                      width={400}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      alt=""
                    />
                  )}
                  <span className="formats__option-text">
                    <span className="formats__option-label">{variant.label}</span>
                    <span className="formats__option-shape">{variant.shape}</span>
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="formats__buy" aria-live="polite">
            <p className="formats__price">
              {selected.price !== null ? (
                formatPrice(selected.price, site.locale)
              ) : (
                <>
                  <span className="formats__price-label">Prix du {selected.label}</span> <ToConfirm />
                </>
              )}
            </p>
            {canOrder ? (
              <a className="btn btn--primary" href={checkoutUrl}>
                Commander le {selected.label}
              </a>
            ) : (
              <button type="button" className="btn btn--primary" disabled>
                Commande bientôt disponible
              </button>
            )}
          </div>
          {!canOrder && (
            <p className="formats__notice">La vente en ligne n’est pas encore ouverte : aucune commande n’est enregistrée.</p>
          )}
        </Reveal>
      </div>
    </section>
  )
}

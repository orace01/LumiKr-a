import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from '../components/Link'
import { VARIANT_PHOTOS, VARIANT_TINTS } from '../components/variantPhotos'
import { product, type Variant } from '../config/product'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useReveal } from '../hooks/useReveal'
import { withTransition } from '../router'
import { usePriceLabel } from '../shop/usePriceLabel'
import './ShopPage.css'

type Filter = 'Tous' | Variant['shape']
const FILTERS: Filter[] = ['Tous', 'Carré', 'Paysage']

// Bandeau défilant : uniquement des informations vérifiées (src/config/product.ts, shop.ts).
const TICKER = ['Acrylique transparent', 'Éclairé par LED', 'Effaçable à sec', 'Branchement USB', 'Livraison offerte en France']

export function ProductCard({ variant, index }: { variant: Variant; index: number }) {
  const priceLabel = usePriceLabel()
  const photo = VARIANT_PHOTOS[variant.id]
  return (
    <Link
      to={`/boutique/${variant.id}`}
      transition
      className="shop-card"
      style={{ '--tint': VARIANT_TINTS[variant.id], '--i': index, viewTransitionName: `carte-${variant.id}` } as CSSProperties}
    >
      <span className="shop-card__tag">{variant.shape}</span>
      <span className="shop-card__media">
        {photo && (
          <img
            className="shop-card__photo"
            src={photo}
            alt=""
            width={400}
            height={300}
            style={{ viewTransitionName: `photo-${variant.id}` }}
          />
        )}
      </span>
      <span className="shop-card__price">{priceLabel(variant.id)}</span>
      <span className="shop-card__name">Tableau lumineux {variant.label}</span>
      <span className="shop-card__shape">{variant.shape === 'Carré' ? 'Plaque carrée' : 'Plaque paysage'}</span>
    </Link>
  )
}

export function ShopPage() {
  useDocumentTitle('Boutique')
  const [filter, setFilter] = useState<Filter>('Tous')
  const filtersRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState({ left: 0, width: 0 })
  const tickerRef = useReveal<HTMLDivElement>()

  // Pastille active : elle glisse sous le filtre choisi (mesurée à nouveau une fois la police chargée).
  useLayoutEffect(() => {
    const measure = () => {
      const active = filtersRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      if (active) setPill({ left: active.offsetLeft, width: active.offsetWidth })
    }
    measure()
    document.fonts.ready.then(measure)
  }, [filter])

  const variants = product.variants.filter((variant) => filter === 'Tous' || variant.shape === filter)

  return (
    <div className="shop">
      <div className="container shop__intro">
        <p className="shop__eyebrow">La boutique</p>
        <h1 className="shop__title">
          <span className="shop__title-caps">Nos</span> <span className="shop__title-script">tableaux.</span>
        </h1>
        <svg className="shop__badge" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
          <defs>
            <path id="badge-cercle" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" />
          </defs>
          <text>
            <textPath href="#badge-cercle">Dessinez · Effacez · Recommencez · </textPath>
          </text>
          <path className="shop__badge-star" d="M60 44l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" />
        </svg>

        <div className="shop__filters" ref={filtersRef} role="group" aria-label="Filtrer par forme">
          <span className="shop__filter-pill" style={{ transform: `translateX(${pill.left}px)`, width: pill.width }} aria-hidden="true" />
          {FILTERS.map((candidate) => (
            <button
              key={candidate}
              type="button"
              className="shop__filter"
              aria-pressed={filter === candidate}
              onClick={() => withTransition(() => setFilter(candidate))}
            >
              {candidate}
            </button>
          ))}
        </div>
      </div>

      <ul className="container shop__grid">
        {variants.map((variant, index) => (
          <li key={variant.id}>
            <ProductCard variant={variant} index={index} />
          </li>
        ))}
      </ul>

      <div className="shop__ticker reveal" ref={tickerRef} aria-hidden="true">
        <div className="shop__ticker-track">
          {[0, 1].map((copy) => (
            <span key={copy}>
              {TICKER.map((item) => (
                <span key={item} className="shop__ticker-item">
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

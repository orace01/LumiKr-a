import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from '../components/Link'
import { QuantityStepper } from '../components/QuantityStepper'
import { VARIANT_TINTS, variantGallery } from '../components/variantPhotos'
import { product, type Fact } from '../config/product'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { REDUCED_MOTION, WIDE_SCREEN, useMediaQuery } from '../hooks/useMediaQuery'
import { useReveal } from '../hooks/useReveal'
import { navigate } from '../router'
import { flyToCart, showToast } from '../shop/cartEffects'
import { useCart } from '../shop/useCart'
import { usePriceLabel } from '../shop/usePriceLabel'
import { useShop } from '../shop/useShop'
import { ProductCard } from './ShopPage'
import './ProductPage.css'

/** Le prix défile jusqu'à sa nouvelle valeur quand on change de format. */
function useCountUp(target: number | null) {
  const reduced = useMediaQuery(REDUCED_MOTION)
  const [value, setValue] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    if (target === null || from.current === null || reduced) {
      from.current = target
      setValue(target)
      return
    }
    const start = from.current
    const began = performance.now()
    let frame = 0
    const step = (now: number) => {
      const k = Math.min(1, (now - began) / 450)
      const eased = 1 - Math.pow(1 - k, 3)
      setValue(Math.round(start + (target - start) * eased))
      if (k < 1) frame = requestAnimationFrame(step)
      else from.current = target
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, reduced])
  return value
}

/** Téléphone : la photo du haut descend plus lentement que le panneau et rétrécit (parallaxe). */
function useParallax(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element || !enabled) return
    let frame = 0
    const update = () => {
      frame = 0
      const y = Math.min(window.scrollY, 600)
      element.style.setProperty('--parallax', `${y * 0.45}px`)
      element.style.setProperty('--shrink', String(1 - Math.min(y / 3000, 0.12)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      element.style.removeProperty('--parallax')
      element.style.removeProperty('--shrink')
    }
  }, [enabled])
  return ref
}

function FactList({ facts }: { facts: Fact[] }) {
  return (
    <dl className="product__facts">
      {facts
        .filter((fact) => fact.verified && fact.value)
        .map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
    </dl>
  )
}

const SECTIONS = [
  { id: 'description', title: 'À propos du produit', body: <p>{product.shortDescription} On écrit au feutre, la lumière de la base révèle le dessin, un coup de chiffon et l’on recommence.</p> },
  { id: 'boite', title: 'Dans la boîte', body: <FactList facts={product.inTheBox} /> },
  { id: 'caracteristiques', title: 'Caractéristiques', body: <FactList facts={product.specs} /> },
]

function ProductNotFound() {
  useDocumentTitle('Produit introuvable')
  return (
    <div className="container order-page order-page--center">
      <h1 className="order-page__title">Produit introuvable</h1>
      <p className="lede">Ce format n’existe pas ou n’est plus proposé.</p>
      <Link to="/boutique" className="btn btn--primary" transition>
        Voir la boutique
      </Link>
    </div>
  )
}

export function ProductPage({ variantId }: { variantId: string }) {
  const variant = product.variants.find((candidate) => candidate.id === variantId)
  if (!variant) return <ProductNotFound />
  return <ProductDetails key={variant.id} variantId={variant.id} />
}

function ProductDetails({ variantId }: { variantId: string }) {
  const variant = product.variants.find((candidate) => candidate.id === variantId)!
  useDocumentTitle(`Tableau lumineux ${variant.label}`)
  const cart = useCart()
  const { info, money, priceOf } = useShop()
  const priceLabel = usePriceLabel()
  const wide = useMediaQuery(WIDE_SCREEN)
  const [quantity, setQuantity] = useState(1)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [tab, setTab] = useState(SECTIONS[0].id)
  const [pressed, setPressed] = useState(false)
  const photoRef = useRef<HTMLImageElement>(null)
  const mediaRef = useParallax(!wide)
  const othersRef = useReveal<HTMLElement>()

  const gallery = variantGallery(variant.id, variant.label)
  const photo = gallery[photoIndex] ?? gallery[0]
  const cents = priceOf(variant.id)
  const shownCents = useCountUp(cents)
  const shipping = info?.shippingMethods.length === 1 ? info.shippingMethods[0] : null
  const others = product.variants.filter((candidate) => candidate.id !== variant.id)

  const guarantees = [
    shipping?.priceCents === 0 ? 'Livraison offerte' : null,
    shipping?.delay ? `Livré en ${shipping.delay}` : null,
    info?.paymentProviderName ? `Paiement sécurisé par ${info.paymentProviderName}` : 'Paiement sécurisé',
  ].filter((text): text is string => Boolean(text))

  const addToCart = () => {
    const from = photoRef.current?.getBoundingClientRect()
    cart.add(variant.id, quantity)
    setPressed(true)
    const label = `Tableau ${variant.label} ajouté au panier`
    if (wide) {
      // Ordinateur (vidéo KVIST) : la photo vole jusqu'au panier, puis le tiroir s'ouvre avec la notification.
      const flight = from && photo ? flyToCart(photo.src, from) : Promise.resolve()
      flight.then(() => {
        cart.open()
        showToast({ text: label, action: { label: 'Voir le panier', onClick: cart.open } })
      })
      return
    }
    // Téléphone (vidéo épicerie) : retour à la grille, la photo vole jusqu'à la barre panier.
    navigate('/boutique', { transition: true })
    window.setTimeout(() => {
      if (from && photo) flyToCart(photo.src, from)
      showToast({ text: label })
    }, 420)
  }

  return (
    <article className="product" style={{ '--tint': VARIANT_TINTS[variant.id] } as CSSProperties}>
      <nav className="container product__crumbs" aria-label="Fil d’Ariane">
        <Link to="/boutique" transition>
          Boutique
        </Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Tableau {variant.label}</span>
      </nav>

      <div className="container product__layout">
        <div className="product__media" ref={mediaRef}>
          <div className="product__stage">
            <img
              key={photo?.src}
              ref={photoRef}
              className="product__photo"
              src={photo?.src}
              alt={photo?.alt ?? ''}
              width={900}
              height={675}
              style={{ viewTransitionName: photoIndex === 0 ? `photo-${variant.id}` : undefined }}
            />
          </div>
          {gallery.length > 1 && (
            <div className="product__thumbs" role="group" aria-label="Photos du produit">
              {gallery.map((item, index) => (
                <button
                  key={item.src}
                  type="button"
                  className="product__thumb"
                  aria-pressed={index === photoIndex}
                  aria-label={`Photo ${index + 1} sur ${gallery.length}`}
                  onClick={() => setPhotoIndex(index)}
                >
                  <img src={item.src} alt="" width={96} height={72} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product__panel">
          <span className="product__handle" aria-hidden="true" />
          <p className="product__eyebrow rise" style={{ '--i': 0 } as CSSProperties}>
            Tableau lumineux · {variant.shape}
          </p>
          <h1 className="product__title rise" style={{ '--i': 1 } as CSSProperties}>
            Tableau lumineux <span className="product__size">{variant.label}</span>
          </h1>
          <p className="product__lede rise" style={{ '--i': 2 } as CSSProperties}>
            {product.shortDescription}
          </p>
          <p className="product__price rise" style={{ '--i': 3 } as CSSProperties}>
            {shownCents === null ? priceLabel(variant.id) : money(shownCents)}
          </p>

          <div className="product__formats rise" style={{ '--i': 4 } as CSSProperties} role="group" aria-label="Format">
            {product.variants.map((candidate) => (
              <Link
                key={candidate.id}
                to={`/boutique/${candidate.id}`}
                transition
                replace
                className="product__format"
                aria-current={candidate.id === variant.id ? 'page' : undefined}
                style={{ '--tint': VARIANT_TINTS[candidate.id] } as CSSProperties}
              >
                <span>{candidate.label}</span>
                <span className="product__format-price">{priceLabel(candidate.id)}</span>
              </Link>
            ))}
          </div>

          <div className="product__buy rise" style={{ '--i': 5 } as CSSProperties}>
            <QuantityStepper value={quantity} onChange={setQuantity} itemLabel={`format ${variant.label}`} />
            <button
              type="button"
              className={`product__add${pressed ? ' is-pressed' : ''}`}
              onClick={addToCart}
              onAnimationEnd={() => setPressed(false)}
            >
              Ajouter au panier
              <svg className="product__add-bag" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
                <path
                  d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8zM9 8V6.5a3 3 0 0 1 6 0V8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <ul className="product__guarantees rise" style={{ '--i': 6 } as CSSProperties}>
            {guarantees.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>

          {/* Ordinateur : onglets ; téléphone : accordéons (même contenu). */}
          <div className="product__tabs rise" style={{ '--i': 7 } as CSSProperties}>
            <div role="tablist" aria-label="Informations produit" className="product__tablist">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  role="tab"
                  id={`onglet-${section.id}`}
                  aria-selected={tab === section.id}
                  aria-controls={`panneau-${section.id}`}
                  className="product__tab"
                  onClick={() => setTab(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </div>
            {SECTIONS.map((section) => (
              <div
                key={section.id}
                role="tabpanel"
                id={`panneau-${section.id}`}
                aria-labelledby={`onglet-${section.id}`}
                hidden={tab !== section.id}
                className="product__tabpanel"
              >
                {section.body}
              </div>
            ))}
          </div>

          <div className="product__accordions rise" style={{ '--i': 7 } as CSSProperties}>
            {SECTIONS.map((section, index) => (
              <details key={section.id} className="product__accordion" open={index === 0}>
                <summary>{section.title}</summary>
                <div className="product__accordion-body">{section.body}</div>
              </details>
            ))}
          </div>
        </div>
      </div>

      <section className="container product__others reveal" ref={othersRef} aria-labelledby="autres-formats">
        <h2 id="autres-formats" className="product__others-title">
          Les autres formats
        </h2>
        <ul className="product__others-list">
          {others.map((other, index) => (
            <li key={other.id}>
              <ProductCard variant={other} index={index} />
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}

import { product } from '../config/product'
import type { PricedLine } from '../shop/types'
import { VARIANT_PHOTOS } from './variantPhotos'
import './OrderSummary.css'

interface OrderSummaryProps {
  lines: PricedLine[]
  subtotalCents: number
  /** `null` : mode de livraison pas encore choisi. */
  shippingCents: number | null
  totalCents: number
  money: (cents: number) => string
  shippingLabel?: string
}

/** Articles et montants d'une commande : récapitulatif de commande, confirmation, suivi. */
export function OrderSummary({ lines, subtotalCents, shippingCents, totalCents, money, shippingLabel }: OrderSummaryProps) {
  return (
    <div className="summary">
      <ul className="summary__lines">
        {lines.map((line) => (
          <li key={line.variantId} className="summary__line">
            <span className="summary__thumb">
              {VARIANT_PHOTOS[line.variantId] && <img src={VARIANT_PHOTOS[line.variantId]} width={80} height={60} alt="" />}
              <span className="summary__qty" aria-hidden="true">
                {line.quantity}
              </span>
            </span>
            <span className="summary__name">
              {product.name}
              <span className="summary__variant">
                Format {line.label} · quantité {line.quantity}
              </span>
            </span>
            <span className="summary__price">{money(line.totalCents)}</span>
          </li>
        ))}
      </ul>
      <dl className="summary__totals">
        <div>
          <dt>Sous-total</dt>
          <dd>{money(subtotalCents)}</dd>
        </div>
        <div>
          <dt>Livraison{shippingLabel ? ` (${shippingLabel})` : ''}</dt>
          <dd>{shippingCents === null ? 'À l’étape suivante' : shippingCents === 0 ? 'Offerte' : money(shippingCents)}</dd>
        </div>
        <div className="summary__total">
          <dt>Total TTC</dt>
          <dd>{money(totalCents)}</dd>
        </div>
      </dl>
    </div>
  )
}

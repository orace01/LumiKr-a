import { shop } from '../config/shop'
import './QuantityStepper.css'

interface QuantityStepperProps {
  value: number
  onChange: (quantity: number) => void
  /** Nom de l'article, pour les libellés lus par les lecteurs d'écran. */
  itemLabel: string
  size?: 'small' | 'normal'
}

export function QuantityStepper({ value, onChange, itemLabel, size = 'normal' }: QuantityStepperProps) {
  const max = shop.maxQuantityPerLine
  return (
    <div className={`stepper stepper--${size}`} role="group" aria-label={`Quantité, ${itemLabel}`}>
      <button
        type="button"
        className="stepper__button"
        aria-label={`Retirer un exemplaire, ${itemLabel}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          <path d="M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </button>
      <output className="stepper__value" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className="stepper__button"
        aria-label={`Ajouter un exemplaire, ${itemLabel}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

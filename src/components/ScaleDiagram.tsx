import type { Variant } from '../config/product'

interface ScaleDiagramProps {
  variants: Variant[]
  selectedId: string
}

// Tout est exprimé en centimètres : 1 unité du viewBox = 1 cm.
const A4 = { width: 21, height: 29.7 }
const MARGIN = 1.5
const VIEW_WIDTH = 30 + MARGIN * 2
const VIEW_HEIGHT = A4.height + MARGIN * 2
const BASELINE = VIEW_HEIGHT - MARGIN

/** Les formats superposés à l'échelle, avec une feuille A4 comme repère. */
export function ScaleDiagram({ variants, selectedId }: ScaleDiagramProps) {
  const selected = variants.find((variant) => variant.id === selectedId)
  // Du plus grand au plus petit, pour que chaque contour reste visible.
  const ordered = [...variants].sort((a, b) => b.widthCm * b.heightCm - a.widthCm * a.heightCm)

  return (
    <svg
      className="scale"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Les ${variants.length} formats à l’échelle, comparés à une feuille A4.${
        selected ? ` Format sélectionné : ${selected.label}.` : ''
      }`}
    >
      <rect
        className="scale__sheet"
        x={MARGIN}
        y={BASELINE - A4.height}
        width={A4.width}
        height={A4.height}
        rx={0.2}
      />
      <text className="scale__sheet-label" x={MARGIN + 0.8} y={BASELINE - A4.height + 1.8}>
        Feuille A4
      </text>

      {ordered.map((variant) => (
        <rect
          key={variant.id}
          className={`scale__board${variant.id === selectedId ? ' scale__board--selected' : ''}`}
          x={MARGIN}
          y={BASELINE - variant.heightCm}
          width={variant.widthCm}
          height={variant.heightCm}
          rx={0.6}
        />
      ))}

      {selected && (
        <text
          className="scale__label"
          x={MARGIN + selected.widthCm - 0.9}
          y={BASELINE - selected.heightCm + 2.1}
          textAnchor="end"
        >
          {selected.label}
        </text>
      )}
    </svg>
  )
}

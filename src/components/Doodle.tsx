import type { CSSProperties } from 'react'
import './Doodle.css'

// Petits tracés « au feutre » purement décoratifs, dans les couleurs du produit.
const SHAPES = {
  star: 'M32 6l7.2 16.2 17.6 1.8-13.2 11.8 3.8 17.4L32 44.2 16.6 53.2l3.8-17.4L7.2 24l17.6-1.8z',
  sparkle: 'M32 6c1.6 13.6 6.4 18.4 20 20-13.6 1.6-18.4 6.4-20 20-1.6-13.6-6.4-18.4-20-20 13.6-1.6 18.4-6.4 20-20z',
  heart: 'M32 54C16 42 8 33 8 23.5 8 16 13.6 11 20 11c5 0 9.4 3 12 7.6C34.6 14 39 11 44 11c6.4 0 12 5 12 12.5C56 33 48 42 32 54z',
  squiggle: 'M4 36c6-16 12-16 18 0s12 16 18 0 12-16 20 0',
  loop: 'M6 44c10-30 26-34 30-18s-18 20-16 4 20-24 38-14',
  zigzag: 'M6 46l10-28 10 28 10-28 10 28 10-28',
} as const

interface DoodleProps {
  shape: keyof typeof SHAPES
  /** Couleur du trait : une variable CSS de la palette, par exemple `var(--pink)`. */
  color: string
  className?: string
  /** Formes pleines pour l'étoile, l'étincelle et le cœur ; les autres restent des traits. */
  filled?: boolean
}

export function Doodle({ shape, color, className, filled = false }: DoodleProps) {
  return (
    <svg
      className={`doodle${className ? ` ${className}` : ''}`}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      style={{ '--doodle': color } as CSSProperties}
    >
      <path d={SHAPES[shape]} fill={filled ? 'var(--doodle)' : 'none'} />
    </svg>
  )
}

import { Fragment, useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import './GiantWords.css'

interface GiantWordsProps {
  words: { text: string; color: string }[]
}

/**
 * Bande de transition : des mots géants glissent de droite à gauche pendant
 * que la bande traverse l'écran, au rythme du défilement. Purement décorative
 * (les mots sont repris dans la section qui suit), donc masquée aux lecteurs
 * d'écran.
 */
export function GiantWords({ words }: GiantWordsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  useScrollProgress(ref, reducedMotion, 'view')

  return (
    <div ref={ref} className="giant" aria-hidden="true">
      <p className="giant__line">
        {words.map((word, index) => (
          <Fragment key={word.text}>
            {index > 0 && (
              <svg className="giant__spark" viewBox="0 0 64 64" focusable="false">
                <path d="M32 4c1.9 16.5 7.6 22.2 24 24-16.4 1.8-22.1 7.5-24 24-1.9-16.5-7.6-22.2-24-24 16.4-1.8 22.1-7.5 24-24z" />
              </svg>
            )}
            <span style={{ color: word.color }}>{word.text}</span>
          </Fragment>
        ))}
      </p>
    </div>
  )
}

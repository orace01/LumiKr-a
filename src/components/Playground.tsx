import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { product } from '../config/product'
import './Playground.css'

interface Stroke {
  color: string
  /** Paires x, y normalisées entre 0 et 1, pour survivre au redimensionnement. */
  points: number[]
}

const [YELLOW, GREEN, , , PINK, ORANGE] = product.penColors.map((pen) => pen.hex)

// Dessin de départ, décrit dans un repère 300 × 200 puis normalisé.
function seedStrokes(): Stroke[] {
  const normalize = (points: number[]) => points.map((value, index) => value / (index % 2 ? 200 : 300))
  const strokes: Stroke[] = []

  const sun: number[] = []
  for (let step = 0; step <= 24; step++) {
    const angle = (step / 24) * Math.PI * 2
    sun.push(62 + Math.cos(angle) * 17, 58 + Math.sin(angle) * 17)
  }
  strokes.push({ color: YELLOW, points: normalize(sun) })
  for (let ray = 0; ray < 8; ray++) {
    const angle = (ray / 8) * Math.PI * 2
    strokes.push({
      color: YELLOW,
      points: normalize([
        62 + Math.cos(angle) * 25,
        58 + Math.sin(angle) * 25,
        62 + Math.cos(angle) * 34,
        58 + Math.sin(angle) * 34,
      ]),
    })
  }

  const heart: number[] = []
  for (let step = 0; step <= 32; step++) {
    const t = (step / 32) * Math.PI * 2
    heart.push(
      226 + 1.35 * 16 * Math.sin(t) ** 3,
      78 - 1.35 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
    )
  }
  strokes.push({ color: PINK, points: normalize(heart) })

  const wave: number[] = []
  for (let x = 40; x <= 260; x += 5) wave.push(x, 150 + Math.sin((x - 40) / 16) * 9)
  strokes.push({ color: GREEN, points: normalize(wave) })

  strokes.push({ color: ORANGE, points: normalize([128, 96, 138, 76, 148, 96, 158, 76, 168, 96, 178, 76]) })
  return strokes
}

export function Playground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Stroke[]>(seedStrokes())
  const current = useRef<Stroke | null>(null)
  const [color, setColor] = useState(YELLOW)
  const [night, setNight] = useState(true)
  const [hasDrawn, setHasDrawn] = useState(false)

  const paint = useCallback(
    (context: CanvasRenderingContext2D, stroke: Stroke, fromPoint = 0) => {
      const { width, height } = context.canvas
      const lineWidth = Math.max(3, width * 0.009)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.lineWidth = lineWidth
      context.strokeStyle = stroke.color
      context.shadowColor = stroke.color
      context.shadowBlur = night ? lineWidth * 2.2 : 0

      const { points } = stroke
      const start = Math.max(0, fromPoint) * 2
      context.beginPath()
      context.moveTo(points[start] * width, points[start + 1] * height)
      // Un point seul doit rester visible : on trace un segment minuscule.
      if (points.length - start <= 2) context.lineTo(points[start] * width + 0.1, points[start + 1] * height)
      for (let index = start + 2; index < points.length; index += 2) {
        context.lineTo(points[index] * width, points[index + 1] * height)
      }
      context.stroke()
    },
    [night],
  )

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    for (const stroke of strokes.current) paint(context, stroke)
  }, [paint])

  // La résolution du canevas suit sa taille affichée et la densité de l'écran.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * ratio)
      canvas.height = Math.round(canvas.clientHeight * ratio)
      redraw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [redraw])

  const pointFromEvent = (event: PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = event.currentTarget.getBoundingClientRect()
    return [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height]
  }

  const startStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const stroke: Stroke = { color, points: pointFromEvent(event) }
    current.current = stroke
    strokes.current.push(stroke)
    setHasDrawn(true)
    const context = event.currentTarget.getContext('2d')
    if (context) paint(context, stroke)
  }

  const extendStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    const stroke = current.current
    if (!stroke) return
    stroke.points.push(...pointFromEvent(event))
    const context = event.currentTarget.getContext('2d')
    // Seul le dernier segment est tracé : pas de redessin complet à chaque mouvement.
    if (context) paint(context, stroke, stroke.points.length / 2 - 2)
  }

  const endStroke = () => {
    current.current = null
  }

  const clear = () => {
    strokes.current = []
    current.current = null
    setHasDrawn(true)
    redraw()
  }

  return (
    <div className="playground">
      <div className={`playground__stage on-night${night ? '' : ' playground__stage--day'}`}>
        <div className="playground__board">
          <canvas
            ref={canvasRef}
            className="playground__canvas"
            role="img"
            aria-label="Zone de dessin : tracez à la souris, au doigt ou au stylet."
            onPointerDown={startStroke}
            onPointerMove={extendStroke}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
          />
          {!hasDrawn && (
            <p className="playground__hint" aria-hidden="true">
              Dessinez ici
            </p>
          )}
        </div>
        <div className="playground__base" aria-hidden="true" />
      </div>

      <div className="playground__controls">
        <fieldset className="playground__pens">
          <legend>Couleur du feutre</legend>
          <div className="playground__swatches">
            {product.penColors.map((pen) => (
              <label key={pen.hex} className="playground__swatch" style={{ color: pen.hex }}>
                <input
                  type="radio"
                  name="feutre"
                  className="visually-hidden"
                  checked={color === pen.hex}
                  onChange={() => setColor(pen.hex)}
                />
                <span className="playground__dot" aria-hidden="true" />
                <span className="visually-hidden">{pen.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="playground__buttons">
          <button type="button" className="btn btn--light btn--small" onClick={() => setNight(!night)}>
            {night ? 'Rallumer la pièce' : 'Éteindre la pièce'}
          </button>
          <button type="button" className="btn btn--ink btn--small" onClick={clear}>
            Tout effacer
          </button>
        </div>
      </div>

      <p className="playground__note">
        Illustration interactive, pas une photo : le rendu réel du tableau est celui de la vidéo.
      </p>
    </div>
  )
}

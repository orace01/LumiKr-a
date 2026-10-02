import { useEffect, useRef, useState } from 'react'
import poster from '../assets/media/hero-poster.webp'
import video from '../assets/media/hero.mp4'
import { useMediaQuery } from '../hooks/useMediaQuery'

const DESCRIPTION =
  'Un dessin de Noël tracé aux feutres de couleur s’illumine sur le tableau en acrylique, dans une pièce sombre.'

function prefersReducedData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true
}

/**
 * Vidéo du hero : poster, vidéo et bouton lecture/pause. Un seul fichier pour
 * tous les écrans : c'est le cadre (Hero.css) qui choisit ce qu'on en voit.
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pausedByUser = useRef(false)
  const [playing, setPlaying] = useState(false)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Lecture automatique seulement quand la vidéo est à l'écran, et jamais si
  // l'utilisateur a demandé moins d'animations ou d'économiser ses données :
  // le fichier n'est alors téléchargé qu'au clic sur « Lire ».
  useEffect(() => {
    const node = videoRef.current
    if (!node || reducedMotion || prefersReducedData()) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) node.pause()
        // Si le navigateur bloque la lecture, le poster et le bouton restent.
        else if (!pausedByUser.current) node.play().catch(() => {})
      },
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [reducedMotion])

  const toggle = () => {
    const node = videoRef.current
    if (!node) return
    if (node.paused) {
      pausedByUser.current = false
      node.play().catch(() => {})
    } else {
      pausedByUser.current = true
      node.pause()
    }
  }

  return (
    <>
      <div className="hero__media">
        <img src={poster} width={1920} height={864} alt={DESCRIPTION} fetchPriority="high" decoding="async" />
        <video
          ref={videoRef}
          src={video}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          aria-label="Vidéo réelle du tableau lumineux, sans son"
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>

      <button type="button" className="hero__toggle" onClick={toggle}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          {playing ? (
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
          ) : (
            <path d="M8 5.2v13.6a.6.6 0 0 0 .92.5l10.4-6.8a.6.6 0 0 0 0-1L8.92 4.7A.6.6 0 0 0 8 5.2z" fill="currentColor" />
          )}
        </svg>
        <span className="visually-hidden">{playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}</span>
      </button>
    </>
  )
}

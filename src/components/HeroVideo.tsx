import { useEffect, useRef, useState } from 'react'
import videoPortrait from '../assets/media/hero-portrait.mp4'
import posterPortrait from '../assets/media/hero-poster-portrait.webp'
import posterWide from '../assets/media/hero-poster-wide.webp'
import videoWide from '../assets/media/hero-wide.mp4'
import { useMediaQuery } from '../hooks/useMediaQuery'

// Un cadrage dédié aux écrans en portrait : en plein écran, le plan large n'y
// montrerait qu'une bande étroite et mal centrée du tableau.
const PORTRAIT_QUERY = '(orientation: portrait)'
const DESCRIPTION =
  'Un dessin de Noël tracé aux feutres de couleur s’illumine sur le tableau en acrylique, dans une pièce sombre.'

function prefersReducedData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true
}

/** Fond vidéo plein écran du hero : poster, vidéo et bouton lecture/pause. */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pausedByUser = useRef(false)
  const [playing, setPlaying] = useState(false)
  const portrait = useMediaQuery(PORTRAIT_QUERY)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const src = portrait ? videoPortrait : videoWide

  // Lecture automatique seulement quand la vidéo est à l'écran, et jamais si
  // l'utilisateur a demandé moins d'animations ou d'économiser ses données :
  // le fichier n'est alors téléchargé qu'au clic sur « Lire ».
  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion || prefersReducedData()) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) video.pause()
        // Si le navigateur bloque la lecture, le poster et le bouton restent.
        else if (!pausedByUser.current) video.play().catch(() => {})
      },
      { threshold: 0.2 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [src, reducedMotion])

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      pausedByUser.current = false
      video.play().catch(() => {})
    } else {
      pausedByUser.current = true
      video.pause()
    }
  }

  return (
    <>
      <div className="hero__media">
        <picture>
          <source media={PORTRAIT_QUERY} srcSet={posterPortrait} width={720} height={960} />
          <img src={posterWide} width={1920} height={864} alt={DESCRIPTION} fetchPriority="high" decoding="async" />
        </picture>
        <video
          ref={videoRef}
          src={src}
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

import { useEffect, useState } from 'react'
import { site } from '../config/site'
import { useMediaQuery } from '../hooks/useMediaQuery'
import './Header.css'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  // Avec les animations réduites, le hero s'affiche déjà refermé sur fond clair :
  // le header ne survole jamais la vidéo plein écran.
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const solid = scrolled || reducedMotion

  useEffect(() => {
    // Transparent sur la vidéo plein écran ; dès qu'elle commence à se refermer,
    // le fond clair apparaît autour et le header prend ses couleurs normales.
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header${solid ? ' header--scrolled' : ' on-night'}`}>
      <div className="container header__inner">
        <a className="header__brand" href="#accueil" aria-label={`${site.brand}, retour en haut de page`}>
          <svg className="header__mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <path d="M32 4c1.9 16.5 7.6 22.2 24 24-16.4 1.8-22.1 7.5-24 24-1.9-16.5-7.6-22.2-24-24 16.4-1.8 22.1-7.5 24-24z" />
          </svg>
          {site.brand}
        </a>

        <nav className="header__nav" aria-label="Sections de la page">
          <ul>
            {site.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="btn btn--primary btn--small header__cta" href={site.primaryCta.href}>
          {site.primaryCta.label}
        </a>
      </div>
    </header>
  )
}

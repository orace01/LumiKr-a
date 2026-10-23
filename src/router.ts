import { useSyncExternalStore } from 'react'

// Navigation entre les pages du site sans bibliothèque : l'adresse est lue dans
// window.location et mise à jour avec l'API History. Le serveur renvoie
// app.html pour toutes les adresses, sauf l'accueil (/), qui est la page
// statique de frontend2/ : on y va en rechargeant la page.

const NAVIGATE_EVENT = 'lumikrea:navigate'

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(NAVIGATE_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(NAVIGATE_EVENT, onChange)
  }
}

/** Chemin et paramètres de l'adresse courante ; se met à jour à chaque navigation. */
export function useLocation() {
  const pathname = useSyncExternalStore(subscribe, () => window.location.pathname)
  const search = useSyncExternalStore(subscribe, () => window.location.search)
  return { pathname, search }
}

/** Fait défiler jusqu'à l'ancre de l'adresse, une fois la page affichée. */
export function scrollToHash(hash: string) {
  if (!hash) return
  requestAnimationFrame(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView())
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  const url = new URL(to, window.location.href)
  if (url.origin !== window.location.origin || url.pathname === '/') {
    window.location.assign(url)
    return
  }
  window.history[options.replace ? 'replaceState' : 'pushState'](null, '', url)
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
  if (url.hash) scrollToHash(url.hash)
  else window.scrollTo(0, 0)
}

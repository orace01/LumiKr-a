// Effets visuels du panier, partagés entre la fiche, la barre panier et l'en-tête :
// une photo qui vole jusqu'au panier, le nombre d'articles qui rebondit, une notification.

const BUMP_EVENT = 'lumikrea:panier-rebond'
const TOAST_EVENT = 'lumikrea:notification'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Cible visible du vol : la barre panier (téléphone) ou le bouton panier de l'en-tête (ordinateur). */
function cartTarget(): DOMRect | null {
  for (const element of document.querySelectorAll<HTMLElement>('[data-cart-target]')) {
    const rect = element.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) return rect
  }
  return null
}

/**
 * Une copie de la photo part de `from` (position à l'écran) et vole en arc jusqu'au panier,
 * en rétrécissant ; le nombre d'articles rebondit à l'arrivée.
 */
export function flyToCart(src: string, from: DOMRect) {
  const to = cartTarget()
  if (!to || reduced()) {
    bumpCart()
    return Promise.resolve()
  }
  const ghost = document.createElement('img')
  ghost.src = src
  ghost.alt = ''
  ghost.className = 'cart-ghost'
  Object.assign(ghost.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` })
  document.body.append(ghost)

  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  const scale = Math.max(0.08, Math.min(to.height / from.height, 0.3))
  const animation = ghost.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1, borderRadius: '1.25rem' },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 80}px) scale(${(1 + scale) / 2})`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.6, borderRadius: '50%' },
    ],
    { duration: 750, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
  )
  return animation.finished.then(() => {
    ghost.remove()
    bumpCart()
  })
}

/** Fait rebondir les pastilles du nombre d'articles (en-tête, barre panier). */
export function bumpCart() {
  window.dispatchEvent(new Event(BUMP_EVENT))
}

export function onCartBump(handler: () => void) {
  window.addEventListener(BUMP_EVENT, handler)
  return () => window.removeEventListener(BUMP_EVENT, handler)
}

export interface ToastMessage {
  text: string
  action?: { label: string; onClick: () => void }
}

/** Affiche une notification en bas de l'écran (composant <Toast>). */
export function showToast(message: ToastMessage) {
  window.dispatchEvent(new CustomEvent<ToastMessage>(TOAST_EVENT, { detail: message }))
}

export function onToast(handler: (message: ToastMessage) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<ToastMessage>).detail)
  window.addEventListener(TOAST_EVENT, listener)
  return () => window.removeEventListener(TOAST_EVENT, listener)
}

import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

// Défilement fluide (Lenis) sur toutes les pages de l'app : il fait défiler la vraie fenêtre, les éléments collants
// et les mesures de défilement restent natifs. Molette et pavé tactile seulement (le doigt garde le défilement du
// téléphone) ; rien quand le mouvement est réduit. Le routeur s'en sert pour remonter en haut et pour les ancres.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const lenis: Lenis | null = reduced ? null : new Lenis({ autoRaf: true, allowNestedScroll: true })

if (lenis) {
  // Un panneau ouvert (panier) bloque la page : Lenis s'arrête aussi, sinon la molette ferait défiler dessous.
  const suivre = () => (document.querySelector('dialog[open]') ? lenis.stop() : lenis.start())
  new MutationObserver(suivre).observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['open'],
  })
}

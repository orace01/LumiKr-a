import { useEffect } from 'react'
import { Demonstration } from '../components/Demonstration'
import { Details } from '../components/Details'
import { Faq } from '../components/Faq'
import { Finale } from '../components/Finale'
import { Formats } from '../components/Formats'
import { GiantWords } from '../components/GiantWords'
import { Hero } from '../components/Hero'
import { Intro } from '../components/Intro'
import { Usages } from '../components/Usages'
import { product } from '../config/product'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { scrollToHash } from '../router'

// Les usages, annoncés en mots géants juste avant leur section.
const USAGE_WORDS = [
  { text: 'Fêter', color: 'var(--orange)' },
  { text: 'Décorer', color: 'var(--violet)' },
  { text: 'Écrire', color: 'var(--blue)' },
  { text: 'Créer', color: 'var(--primary)' },
]

/**
 * Toute la découverte du produit tient sur cette page, jusqu'au choix du
 * format et à l'ajout au panier (section Formats). La commande se fait ensuite
 * sur ses propres pages.
 */
export function LandingPage() {
  useDocumentTitle(`Le ${product.name.charAt(0).toLowerCase()}${product.name.slice(1)}`)

  // Arrivée depuis une autre page sur une ancre (« /#formats ») : on y descend
  // une fois les sections affichées.
  useEffect(() => {
    scrollToHash(window.location.hash)
  }, [])

  return (
    <>
      <Hero />
      <Intro />
      <Demonstration />
      <GiantWords words={USAGE_WORDS} />
      <Usages />
      <Formats />
      <Details />
      <Faq />
      <Finale />
    </>
  )
}

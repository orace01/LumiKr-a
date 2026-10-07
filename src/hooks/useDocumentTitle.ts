import { useEffect } from 'react'
import { site } from '../config/site'

/** Titre de l'onglet, propre à chaque page (« Votre commande · Lumikréa »). */
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title) document.title = `${title} · ${site.brand}`
  }, [title])
}

import { useEffect } from 'react'
import { site } from '../config/site'

interface SeoOptions {
  /** Description de la page (balise meta et Open Graph) ; sans elle, celle d'app.html est gardée. */
  description?: string
  /** Page privée ou introuvable : pas d'indexation ni d'URL canonique (R-008). */
  noindex?: boolean
}

/** Pose (ou met à jour) une balise <meta> ou <link> de l'en-tête ; `null` la retire. */
function headTag(selector: string, create: () => HTMLElement, attribute: string, value: string | null) {
  let element = document.head.querySelector<HTMLElement>(selector)
  if (value === null) {
    element?.remove()
    return
  }
  if (!element) {
    element = create()
    document.head.append(element)
  }
  element.setAttribute(attribute, value)
}

const meta = (key: 'name' | 'property', name: string) => () => {
  const element = document.createElement('meta')
  element.setAttribute(key, name)
  return element
}

/**
 * Titre de l'onglet, propre à chaque page (« Votre commande · Lumikréa »), et balises de référencement :
 * description, URL canonique, Open Graph, et noindex des pages privées (R-008).
 */
export function useDocumentTitle(title: string | null, options: SeoOptions = {}) {
  const { description, noindex = false } = options
  useEffect(() => {
    if (!title) return
    const fullTitle = `${title} · ${site.brand}`
    document.title = fullTitle
    const url = `${site.url}${window.location.pathname.replace(/\/+$/, '') || '/'}`
    headTag('meta[property="og:title"]', meta('property', 'og:title'), 'content', fullTitle)
    headTag('meta[property="og:url"]', meta('property', 'og:url'), 'content', url)
    if (description) {
      headTag('meta[name="description"]', meta('name', 'description'), 'content', description)
      headTag('meta[property="og:description"]', meta('property', 'og:description'), 'content', description)
    }
    headTag('meta[name="robots"]', meta('name', 'robots'), 'content', noindex ? 'noindex, nofollow' : null)
    headTag(
      'link[rel="canonical"]',
      () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
      'href',
      noindex ? null : url,
    )
  }, [title, description, noindex])
}

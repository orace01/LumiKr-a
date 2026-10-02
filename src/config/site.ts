// Identité de la boutique. Tout ce qui est provisoire est centralisé ici :
// changer le nom de marque ou raccorder un lien légal ne demande aucune
// modification de composant.

export interface LegalLink {
  label: string
  /** `null` tant que la page ou la politique n'est pas définie. */
  href: string | null
}

// À CONFIRMER : pages légales à rédiger selon le marché visé.
const legalLinks: LegalLink[] = [
  { label: 'Mentions légales', href: null },
  { label: 'Conditions générales de vente', href: null },
  { label: 'Politique de confidentialité', href: null },
  { label: 'Livraison et retours', href: null },
]

export const site = {
  /** À CONFIRMER : nom de marque provisoire. */
  brand: 'Lumikréa',
  locale: 'fr-FR',
  tagline: 'Leur imagination n’a jamais été aussi lumineuse.',

  nav: [
    { label: 'Démonstration', href: '#demonstration' },
    { label: 'Usages', href: '#usages' },
    { label: 'Formats', href: '#formats' },
    { label: 'Questions', href: '#questions' },
  ],
  primaryCta: { label: 'Choisir mon format', href: '#formats' },

  /** À CONFIRMER : adresse de contact du service client. */
  contactEmail: null as string | null,

  legalLinks,
}

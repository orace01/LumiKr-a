// Identité de la boutique. Tout ce qui est provisoire est centralisé ici :
// changer le nom de marque ou raccorder un lien légal ne demande aucune
// modification de composant.

export interface LegalPage {
  /** Adresse de la page (/cgv, …). */
  path: string
  title: string
  /**
   * Texte de la page, paragraphes séparés par une ligne vide. `null` tant
   * qu'il n'est pas rédigé : la page affiche « Contenu à rédiger ».
   */
  body: string | null
}

// À RÉDIGER : textes à établir selon le marché visé et ta structure juridique
// (droit de rétractation, garanties, délais, données personnelles…).
const legalPages: LegalPage[] = [
  { path: '/mentions-legales', title: 'Mentions légales', body: null },
  { path: '/cgv', title: 'Conditions générales de vente', body: null },
  { path: '/confidentialite', title: 'Politique de confidentialité', body: null },
  { path: '/livraison-retours', title: 'Livraison et retours', body: null },
]

export const site = {
  /** À CONFIRMER : nom de marque provisoire. */
  brand: 'Lumikréa',
  locale: 'fr-FR',
  tagline: 'Leur imagination n’a jamais été aussi lumineuse.',

  // Ancres de la page d'accueil, préfixées par « / » pour fonctionner depuis
  // toutes les pages du site.
  nav: [
    { label: 'Démonstration', href: '/#demonstration' },
    { label: 'Usages', href: '/#usages' },
    { label: 'Formats', href: '/#formats' },
    { label: 'Questions', href: '/#questions' },
  ],
  primaryCta: { label: 'Choisir mon format', href: '/#formats' },

  /** À CONFIRMER : adresse de contact du service client. */
  contactEmail: null as string | null,

  legalPages,
}

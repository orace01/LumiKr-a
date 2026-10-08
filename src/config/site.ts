// Identité de la boutique. Tout ce qui est provisoire est centralisé ici :
// changer le nom de marque ou raccorder un lien légal ne demande aucune
// modification de composant.

export interface LegalPage {
  /** Adresse de la page (/cgv, …). Son texte est dans src/content/legal/. */
  path: string
  title: string
}

const legalPages: LegalPage[] = [
  { path: '/mentions-legales', title: 'Mentions légales' },
  { path: '/cgv', title: 'Conditions générales de vente' },
  { path: '/confidentialite', title: 'Politique de confidentialité' },
  { path: '/livraison-retours', title: 'Livraison et retours' },
]

/**
 * Identité légale du vendeur, reprise dans les pages légales. `null` = pas
 * encore renseigné : la page affiche « à compléter » et, en mode réel, la
 * vente reste fermée (obligatoire pour vendre en ligne en France).
 */
export interface Seller {
  /** Raison sociale, ou prénom et nom suivis de « EI » pour un entrepreneur individuel. */
  name: string | null
  /** Forme juridique : « Entrepreneur individuel (micro-entreprise) », « SAS au capital de 1 000 € »… */
  legalForm: string | null
  /** Adresse postale complète. */
  address: string | null
  /** Immatriculation : « SIREN 123 456 789, RCS Paris », ou « SIREN 123 456 789, RNE ». */
  registration: string | null
  /** Numéro de TVA intracommunautaire, ou « TVA non applicable, article 293 B du CGI ». */
  vat: string | null
  phone: string | null
  /** Directeur ou directrice de la publication, le plus souvent le dirigeant. */
  publisher: string | null
  /** Hébergeur du site : nom, adresse et téléphone. */
  host: string | null
  /** Médiateur de la consommation auquel tu adhères : nom et adresse de son site. */
  mediator: string | null
}

// À COMPLÉTER : identité du vendeur.
const seller: Seller = {
  name: null,
  legalForm: null,
  address: null,
  registration: null,
  vat: null,
  phone: null,
  publisher: null,
  host: null,
  mediator: null,
}

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
  seller,
}

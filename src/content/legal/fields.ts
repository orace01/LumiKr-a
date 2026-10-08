import { shop } from '../../config/shop'
import { site } from '../../config/site'

// Valeurs des jetons {…} des pages légales, tirées de la configuration. Ce
// fichier est aussi lu par le serveur : en mode réel, la vente reste fermée
// tant qu'une information indispensable manque.
//
// Indispensable (`required`) : sans elle, la page affiche « à compléter ».
// Facultative : la ligne qui l'emploie est retirée tant qu'elle manque ; les
// informations d'entreprise (choix du 8 octobre 2026 : pas d'entreprise
// enregistrée pour l'instant) apparaissent dès qu'elles sont renseignées.

export interface LegalField {
  /** Nom de l'information, affiché « à compléter : … » tant qu'elle manque. */
  label: string
  /** `null` = information manquante. */
  value: string | null
  /** Lien vers lequel pointe la valeur (adresse e-mail). */
  href?: string
  /** Indispensable pour vendre : affichée « à compléter » tant qu'elle manque. */
  required: boolean
}

/** `siteHost` : adresse du site, connue du navigateur au moment de l'affichage. */
export function legalFields(siteHost: string | null = null): Record<string, LegalField> {
  const { seller, contactEmail } = site
  // Le délai annoncé est celui du mode de livraison proposé (un seul pour l'instant).
  const delay = shop.shippingMethods[0]?.delay ?? null
  return {
    marque: { label: 'nom de marque', value: site.brand, required: false },
    site: { label: 'adresse du site', value: siteHost, required: false },
    vendeur: { label: 'nom ou raison sociale du vendeur', value: seller.name, required: false },
    statut: { label: 'forme juridique', value: seller.legalForm, required: false },
    adresse: { label: 'adresse postale du vendeur', value: seller.address, required: false },
    immatriculation: { label: 'numéro SIREN et immatriculation', value: seller.registration, required: false },
    tva: { label: 'numéro de TVA ou mention d’exonération', value: seller.vat, required: false },
    telephone: { label: 'téléphone du service client', value: seller.phone, required: false },
    email: {
      label: 'e-mail du service client',
      value: contactEmail,
      ...(contactEmail ? { href: `mailto:${contactEmail}` } : {}),
      required: true,
    },
    directeur: { label: 'directeur de la publication', value: seller.publisher, required: false },
    hebergeur: { label: 'hébergeur du site', value: seller.host, required: false },
    mediateur: { label: 'médiateur de la consommation', value: seller.mediator, required: false },
    delai: { label: 'délai de livraison', value: delay, required: true },
    paiement: {
      label: 'prestataire de paiement',
      value: shop.paymentProviderName ?? 'notre prestataire de paiement sécurisé',
      required: false,
    },
  }
}

/** Informations légales indispensables encore manquantes, en clair. */
export function missingLegalInfo(): string[] {
  return Object.values(legalFields())
    .filter((field) => field.required && field.value === null)
    .map((field) => field.label)
}

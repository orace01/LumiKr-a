import { shop } from '../../config/shop'
import { site } from '../../config/site'

// Valeurs des jetons {…} des pages légales, tirées de la configuration. Ce
// fichier est aussi lu par le serveur : en mode réel, la vente reste fermée
// tant qu'une information obligatoire manque.

export interface LegalField {
  /** Nom de l'information, affiché « à compléter : … » tant qu'elle manque. */
  label: string
  /** `null` = information manquante. */
  value: string | null
  /** Lien vers lequel pointe la valeur (adresse e-mail). */
  href?: string
  /** Obligatoire pour vendre en ligne. */
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
    vendeur: { label: 'nom ou raison sociale du vendeur', value: seller.name, required: true },
    statut: { label: 'forme juridique', value: seller.legalForm, required: true },
    adresse: { label: 'adresse postale du vendeur', value: seller.address, required: true },
    immatriculation: { label: 'numéro SIREN et immatriculation', value: seller.registration, required: true },
    tva: { label: 'numéro de TVA ou mention d’exonération', value: seller.vat, required: true },
    telephone: { label: 'téléphone du service client', value: seller.phone, required: true },
    email: {
      label: 'e-mail du service client',
      value: contactEmail,
      ...(contactEmail ? { href: `mailto:${contactEmail}` } : {}),
      required: true,
    },
    directeur: { label: 'directeur de la publication', value: seller.publisher, required: true },
    hebergeur: { label: 'hébergeur du site', value: seller.host, required: true },
    mediateur: { label: 'médiateur de la consommation', value: seller.mediator, required: true },
    delai: { label: 'délai de livraison', value: delay, required: true },
    paiement: {
      label: 'prestataire de paiement',
      value: shop.paymentProviderName ?? 'notre prestataire de paiement sécurisé',
      required: false,
    },
  }
}

/** Informations légales obligatoires encore manquantes, en clair. */
export function missingLegalInfo(): string[] {
  return Object.values(legalFields())
    .filter((field) => field.required && field.value === null)
    .map((field) => field.label)
}

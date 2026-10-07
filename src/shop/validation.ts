import type { CheckoutCustomer, FieldErrors } from './types'

// Mêmes règles dans le navigateur (messages immédiats) et sur le serveur (seul
// juge). Elles restent volontairement souples : le transporteur et CJ ont
// besoin d'une adresse exploitable, pas d'un format national strict.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^\+?[0-9 ().-]{6,20}$/
const POSTAL_CODE = /^[A-Za-z0-9][A-Za-z0-9 -]{1,10}$/

/** Retire les espaces superflus et borne la longueur de chaque champ. */
export function normalizeCustomer(input: Partial<Record<keyof CheckoutCustomer, unknown>>): CheckoutCustomer {
  const text = (value: unknown, max: number) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : ''
  return {
    email: text(input.email, 254).toLowerCase(),
    phone: text(input.phone, 30),
    firstName: text(input.firstName, 60),
    lastName: text(input.lastName, 60),
    address1: text(input.address1, 120),
    address2: text(input.address2, 120),
    postalCode: text(input.postalCode, 12).toUpperCase(),
    city: text(input.city, 80),
    region: text(input.region, 80),
    country: text(input.country, 2).toUpperCase(),
    shippingMethodId: text(input.shippingMethodId, 40),
    acceptTerms: input.acceptTerms === true,
  }
}

interface Allowed {
  countries: string[]
  shippingMethodIds: string[]
}

export function validateCustomer(customer: CheckoutCustomer, allowed: Allowed): FieldErrors {
  const errors: FieldErrors = {}

  if (!customer.email) errors.email = 'Indiquez votre adresse e-mail.'
  else if (!EMAIL.test(customer.email)) errors.email = 'Cette adresse e-mail semble incomplète.'

  if (!customer.phone) errors.phone = 'Indiquez un numéro de téléphone pour le transporteur.'
  else if (!PHONE.test(customer.phone)) errors.phone = 'Ce numéro de téléphone ne semble pas valide.'

  if (!customer.firstName) errors.firstName = 'Indiquez votre prénom.'
  if (!customer.lastName) errors.lastName = 'Indiquez votre nom.'

  if (!customer.address1) errors.address1 = 'Indiquez votre adresse.'
  else if (customer.address1.length < 4) errors.address1 = 'Cette adresse semble incomplète.'

  if (!customer.postalCode) errors.postalCode = 'Indiquez votre code postal.'
  else if (!POSTAL_CODE.test(customer.postalCode)) errors.postalCode = 'Ce code postal ne semble pas valide.'

  if (!customer.city) errors.city = 'Indiquez votre ville.'

  if (!allowed.countries.includes(customer.country)) errors.country = 'Nous ne livrons pas encore ce pays.'
  if (!allowed.shippingMethodIds.includes(customer.shippingMethodId)) {
    errors.shippingMethodId = 'Choisissez un mode de livraison.'
  }

  if (!customer.acceptTerms) errors.acceptTerms = 'Acceptez les conditions générales de vente pour commander.'

  return errors
}

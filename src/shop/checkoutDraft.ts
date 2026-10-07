import type { CheckoutCustomer } from './types'

const DRAFT_KEY = 'lumikrea:commande:brouillon'

// Le formulaire de commande est gardé le temps de la session (sessionStorage) :
// un client qui revient d'un paiement annulé retrouve ce qu'il avait saisi. La
// case des CGV n'est jamais pré-cochée. Le navigateur peut refuser ce stockage
// (navigation privée) : le formulaire fonctionne alors sans.

export function loadCheckoutDraft(): Partial<CheckoutCustomer> {
  try {
    const draft = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) ?? '{}')
    return draft && typeof draft === 'object' ? { ...draft, acceptTerms: false } : {}
  } catch {
    return {}
  }
}

export function saveCheckoutDraft(customer: CheckoutCustomer) {
  try {
    const draft: Partial<CheckoutCustomer> = { ...customer }
    delete draft.acceptTerms
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Stockage indisponible.
  }
}

/** Après un paiement confirmé, le formulaire n'a plus à être pré-rempli. */
export function clearCheckoutDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Stockage indisponible.
  }
}

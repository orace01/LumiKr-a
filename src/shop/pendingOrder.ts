const PENDING_KEY = 'lumikrea:commande:en-cours'
// Au-delà, le client ne revient plus de son paiement : on l'oublie.
const MAX_AGE_MS = 24 * 60 * 60_000

// Pendant que le client paie chez le prestataire, le navigateur garde l'adresse
// de confirmation de sa commande (numéro + clé). Mepaye ramène le client sur
// une adresse fixe (/commande/confirmation, sans numéro) : la page retrouve
// ainsi la bonne commande. localStorage plutôt que sessionStorage, au cas où le
// paiement se termine dans un autre onglet. Stockage refusé : sans effet.

export function savePendingOrder(confirmationPath: string) {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify({ path: confirmationPath, at: Date.now() }))
  } catch {
    // Stockage indisponible.
  }
}

/** Adresse de confirmation de la dernière commande en cours de paiement, s'il y en a une. */
export function loadPendingOrder(): string | null {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PENDING_KEY) ?? 'null') as { path?: unknown; at?: unknown } | null
    if (!saved || typeof saved.path !== 'string' || typeof saved.at !== 'number') return null
    if (Date.now() - saved.at > MAX_AGE_MS || !saved.path.startsWith('/commande/confirmation?')) return null
    return saved.path
  } catch {
    return null
  }
}

export function clearPendingOrder() {
  try {
    window.localStorage.removeItem(PENDING_KEY)
  } catch {
    // Stockage indisponible.
  }
}

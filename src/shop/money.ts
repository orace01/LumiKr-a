/** Montant en centimes → texte localisé (« 24,90 € »). */
export function formatMoney(cents: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)
}

/** Prix saisi dans la configuration (unités) → centimes. */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

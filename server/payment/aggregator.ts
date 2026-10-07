import type { PaymentEvent, PaymentOutcome, PaymentProvider, PaymentSession } from './types'

/**
 * ═══ À RACCORDER : ton agrégateur de paiement ═══
 *
 * C'est l'un des deux seuls fichiers à compléter (avec server/fulfillment/cj.ts).
 * Tout le reste du parcours (panier, formulaire, enregistrement de la commande,
 * retour du client, suivi) fonctionne déjà et appelle les trois méthodes
 * ci-dessous.
 *
 * Variables d'environnement prévues (à adapter aux noms de ton prestataire) :
 *   PAYMENT_API_KEY         clé secrète de l'API
 *   PAYMENT_WEBHOOK_SECRET  secret qui signe les notifications
 *   PAYMENT_API_URL         adresse de l'API (bac à sable puis production)
 *
 * Le parcours attendu, commun à la plupart des agrégateurs :
 *   1. createPayment : créer une transaction (montant, devise, description,
 *      e-mail et téléphone du client, URL de retour, URL de notification) et
 *      renvoyer sa référence et l'URL de la page de paiement.
 *   2. Le client paie chez le prestataire, puis revient sur returnUrl.
 *   3. parseNotification : le prestataire appelle POST /api/payments/notify ;
 *      vérifier la signature avec PAYMENT_WEBHOOK_SECRET, puis traduire son
 *      statut en 'paid' | 'failed' | 'cancelled'.
 *   4. fetchStatus (facultatif mais conseillé) : interroger la transaction,
 *      au cas où la notification tarde.
 *
 * Montants : order.totalCents est en centimes. Certains prestataires veulent
 * des centimes, d'autres des unités (XOF, par exemple, n'a pas de centimes) :
 * vérifier leur documentation.
 */
export class AggregatorPaymentProvider implements PaymentProvider {
  readonly id = 'aggregator'

  private readonly apiKey = process.env.PAYMENT_API_KEY ?? ''
  private readonly webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET ?? ''

  isConfigured() {
    // À remplacer par `return Boolean(this.apiKey && this.webhookSecret)` une
    // fois les trois méthodes écrites : la vente s'ouvre alors toute seule.
    return false
  }

  async createPayment(input: Parameters<PaymentProvider['createPayment']>[0]): Promise<PaymentSession> {
    // Exemple de forme (à adapter) :
    // const response = await fetch(`${process.env.PAYMENT_API_URL}/transactions`, {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     amount: input.order.totalCents, currency: input.order.currency,
    //     description: `Commande ${input.order.id}`,
    //     customer: { email: input.order.customer.email, phone: input.order.customer.phone },
    //     return_url: input.returnUrl, cancel_url: input.cancelUrl, callback_url: input.notifyUrl,
    //     metadata: { orderId: input.order.id },
    //   }),
    // })
    // const data = await response.json()
    // return { reference: data.id, redirectUrl: data.payment_url }
    void input
    void this.apiKey
    throw new Error('Paiement non raccordé : compléter server/payment/aggregator.ts.')
  }

  async parseNotification(request: Request): Promise<PaymentEvent | null> {
    // 1. Lire le corps BRUT (await request.text()) avant tout JSON.parse : la
    //    signature se calcule sur les octets reçus.
    // 2. Vérifier la signature (en-tête du prestataire) avec this.webhookSecret,
    //    en comparaison à temps constant (crypto.timingSafeEqual).
    // 3. Renvoyer { reference, outcome } ; `null` si la signature est fausse.
    void request
    void this.webhookSecret
    return null
  }

  async fetchStatus(reference: string): Promise<PaymentOutcome | 'pending'> {
    void reference
    return 'pending'
  }
}

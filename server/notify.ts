import type { Order } from './orders/types'

/**
 * Messages envoyés au client à chaque étape. Pour l'instant ils sont seulement
 * écrits dans le journal du serveur.
 *
 * À brancher plus tard, si ton prestataire de paiement n'envoie pas déjà de
 * reçu : un service d'e-mails transactionnels (confirmation de commande, puis
 * numéro de suivi à l'expédition), sur le même modèle que cette interface.
 */
export interface Notifier {
  orderPaid(order: Order): Promise<void>
  orderShipped(order: Order): Promise<void>
}

export const consoleNotifier: Notifier = {
  async orderPaid(order) {
    console.info(`[commande] ${order.id} payée (${order.totalCents / 100} ${order.currency}) — e-mail de confirmation à envoyer à ${order.customer.email}`)
  },
  async orderShipped(order) {
    console.info(`[commande] ${order.id} expédiée — suivi ${order.fulfillment.trackingNumber ?? 'inconnu'} à envoyer à ${order.customer.email}`)
  },
}

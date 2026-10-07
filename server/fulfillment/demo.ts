import type { Order } from '../orders/types'
import type { FulfillmentProvider, TrackingInfo } from './types'

/**
 * Fournisseur simulé (mode `demo`) : rien n'est envoyé à CJ. Pour voir la page
 * de suivi évoluer, la commande passe « expédiée » deux minutes après le
 * paiement, puis « livrée » cinq minutes après.
 */
export class DemoFulfillmentProvider implements FulfillmentProvider {
  readonly id = 'demo'

  isConfigured() {
    return true
  }

  async createOrder(order: Order) {
    return { supplierOrderId: `DEMO-${order.id}` }
  }

  async getTracking(order: Order): Promise<TrackingInfo | null> {
    if (!order.payment.paidAt) return null
    const minutes = (Date.now() - Date.parse(order.payment.paidAt)) / 60_000
    if (minutes < 2) return { status: 'processing', carrier: null, trackingNumber: null, trackingUrl: null }
    return {
      status: minutes < 5 ? 'shipped' : 'delivered',
      carrier: 'Transporteur fictif',
      trackingNumber: `DEMO${order.id.replace(/\W/g, '')}`,
      trackingUrl: null,
    }
  }
}

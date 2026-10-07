import { product } from '../../src/config/product'
import { shop } from '../../src/config/shop'
import type { Order } from '../orders/types'
import type { FulfillmentProvider, TrackingInfo } from './types'

/**
 * ═══ À RACCORDER : CJdropshipping ═══
 *
 * C'est l'un des deux seuls fichiers à compléter (avec server/payment/aggregator.ts).
 * Il est appelé automatiquement quand un paiement est confirmé
 * (createOrder), puis quand le client consulte son suivi (getTracking).
 *
 * Déjà fait ici : la traduction d'une commande du site en commande CJ
 * (toCjOrder, plus bas), avec les noms de champs de l'API CJ 2.0 tels que je
 * les connais. À VÉRIFIER dans la documentation CJ au moment du raccordement,
 * ainsi que les adresses ci-dessous.
 *
 * Reste à faire :
 *   1. Renseigner les correspondances dans la configuration :
 *      - src/config/product.ts : `cjVariantId` (le « vid ») de chaque format ;
 *      - src/config/shop.ts : `cjLogisticName` de chaque mode de livraison.
 *   2. Variables d'environnement : CJ_API_KEY (et CJ_EMAIL si leur
 *      authentification le demande).
 *   3. Écrire les deux appels HTTP de createOrder et getTracking (squelettes en
 *      commentaire), puis rendre isConfigured() vrai.
 *
 * Adresses de l'API CJ 2.0 (à vérifier) :
 *   POST https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken
 *   POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2
 *   GET  https://developers.cjdropshipping.com/api2.0/v1/shopping/order/getOrderDetail?orderId=…
 *   GET  https://developers.cjdropshipping.com/api2.0/v1/logistic/trackInfo?trackNumber=…
 *   Le jeton obtenu se passe dans l'en-tête « CJ-Access-Token ».
 */
export class CjFulfillmentProvider implements FulfillmentProvider {
  readonly id = 'cj'

  private readonly apiKey = process.env.CJ_API_KEY ?? ''

  isConfigured() {
    // À remplacer par `return Boolean(this.apiKey) && missingCjMapping().length === 0`
    // une fois createOrder et getTracking écrits.
    return false
  }

  async createOrder(order: Order): Promise<{ supplierOrderId: string }> {
    const payload = toCjOrder(order)
    // const token = await this.accessToken()
    // const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2', {
    //   method: 'POST',
    //   headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // })
    // const data = await response.json()
    // if (!data.result) throw new Error(`CJ a refusé la commande : ${data.message}`)
    // return { supplierOrderId: data.data.orderId }
    void payload
    void this.apiKey
    throw new Error('CJ non raccordé : compléter server/fulfillment/cj.ts.')
  }

  async getTracking(order: Order): Promise<TrackingInfo | null> {
    // Lire la commande CJ (getOrderDetail) avec order.fulfillment.supplierOrderId,
    // puis renvoyer son numéro de suivi, son transporteur et son état.
    void order
    return null
  }
}

/** Ce qui manque dans la configuration pour pouvoir transmettre une commande à CJ. */
export function missingCjMapping(): string[] {
  const missing: string[] = []
  for (const variant of product.variants) if (!variant.cjVariantId) missing.push(`cjVariantId du format ${variant.label}`)
  for (const method of shop.shippingMethods) if (!method.cjLogisticName) missing.push(`cjLogisticName de « ${method.label} »`)
  return missing
}

/** Commande du site → corps de requête « createOrderV2 » de CJ (noms de champs à vérifier). */
export function toCjOrder(order: Order) {
  const method = shop.shippingMethods.find((candidate) => candidate.id === order.shippingMethodId)
  const country = shop.countries.find((candidate) => candidate.code === order.shippingAddress.country)
  return {
    orderNumber: order.id,
    shippingCountryCode: order.shippingAddress.country,
    shippingCountry: country?.name ?? order.shippingAddress.country,
    shippingProvince: order.shippingAddress.region || order.shippingAddress.city,
    shippingCity: order.shippingAddress.city,
    shippingZip: order.shippingAddress.postalCode,
    shippingAddress: order.shippingAddress.address1,
    shippingAddress2: order.shippingAddress.address2,
    shippingCustomerName: `${order.customer.firstName} ${order.customer.lastName}`,
    shippingPhone: order.customer.phone,
    email: order.customer.email,
    logisticName: method?.cjLogisticName ?? null,
    products: order.lines.map((line) => ({
      vid: product.variants.find((variant) => variant.id === line.variantId)?.cjVariantId ?? null,
      quantity: line.quantity,
    })),
  }
}

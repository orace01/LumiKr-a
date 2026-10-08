import path from 'node:path'
import { product } from '../../src/config/product'
import { shop } from '../../src/config/shop'
import type { Order } from '../orders/types'
import { CJ_ERRORS, CjApiError, CjClient } from './cj-client'
import type { FulfillmentProvider, TrackingInfo } from './types'

/**
 * Transmission des commandes à CJdropshipping.
 *
 * - createOrder : appelé automatiquement une fois le paiement du client
 *   confirmé. Crée la commande chez CJ (createOrderV2) et, par défaut, la paie
 *   sur le solde du compte CJ (payType 2) : CJ l'expédie alors sans autre action.
 * - getTracking : état de la commande chez CJ et numéro de suivi (getOrderDetail).
 *
 * Réglages : variables CJ_* (voir .env.example) et, dans la configuration,
 * l'identifiant de variante de chaque format (`cjVariantId`, product.ts) et le
 * mode d'envoi CJ de chaque mode de livraison (`cjLogisticName`, shop.ts).
 * `npm run cj` aide à trouver ces valeurs.
 */

export interface CjSettings {
  apiKey: string
  /** Pays de l'entrepôt CJ d'où part le colis (CN par défaut). */
  fromCountryCode: string
  /** 2 : payé sur le solde CJ à la création · 3 : créée seulement, à payer dans le tableau de bord CJ. */
  payType: 2 | 3
  /** Commandes de test CJ : ni débit ni expédition. */
  sandbox: boolean
  /** TVA à l'import dans l'UE (IOSS) : 1 sans IOSS, 2 ton numéro IOSS, 3 l'IOSS de CJ. Obligatoire vers l'UE. */
  iossType: 1 | 2 | 3 | null
  iossNumber: string | null
}

export function readCjSettings(env: NodeJS.ProcessEnv = process.env): CjSettings {
  const ioss = Number(env.CJ_IOSS_TYPE)
  return {
    apiKey: env.CJ_API_KEY?.trim() ?? '',
    fromCountryCode: (env.CJ_FROM_COUNTRY?.trim() || 'CN').toUpperCase(),
    payType: env.CJ_PAY_TYPE === '3' ? 3 : 2,
    sandbox: env.CJ_SANDBOX === '1' || env.CJ_SANDBOX === 'true',
    iossType: ioss === 1 || ioss === 2 || ioss === 3 ? ioss : null,
    iossNumber: env.CJ_IOSS_NUMBER?.trim() || null,
  }
}

/** Correspondances entre la boutique et le catalogue CJ. */
export interface CjMapping {
  /** Format de la boutique → identifiant de variante CJ (« vid »). */
  variantIds: Record<string, string | null>
  /** Mode de livraison de la boutique → nom du mode d'envoi CJ (« logisticName »). */
  logisticNames: Record<string, string | null>
}

export function configuredMapping(): CjMapping {
  return {
    variantIds: Object.fromEntries(product.variants.map((variant) => [variant.id, variant.cjVariantId])),
    logisticNames: Object.fromEntries(shop.shippingMethods.map((method) => [method.id, method.cjLogisticName])),
  }
}

/** Ce qui manque dans la configuration pour pouvoir transmettre une commande à CJ. */
export function missingCjMapping(mapping: CjMapping = configuredMapping()): string[] {
  const missing: string[] = []
  for (const variant of product.variants) if (!mapping.variantIds[variant.id]) missing.push(`cjVariantId du format ${variant.label}`)
  for (const method of shop.shippingMethods) {
    if (!mapping.logisticNames[method.id]) missing.push(`cjLogisticName de « ${method.label} »`)
  }
  return missing
}

// Pays de l'Union européenne : CJ y refuse les commandes sans réglage IOSS.
const EU_COUNTRIES = new Set(['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'])

/** Tout ce qui manque, réglages CJ_* compris, pour pouvoir transmettre une commande à CJ. */
export function missingCjConfig(settings: CjSettings = readCjSettings(), mapping: CjMapping = configuredMapping()): string[] {
  const missing: string[] = []
  if (!settings.apiKey) missing.push('CJ_API_KEY')
  if (settings.iossType === null && shop.countries.some((country) => EU_COUNTRIES.has(country.code))) missing.push('CJ_IOSS_TYPE')
  if (settings.iossType === 2 && !settings.iossNumber) missing.push('CJ_IOSS_NUMBER')
  return [...missing, ...missingCjMapping(mapping)]
}

const englishCountry = new Intl.DisplayNames(['en'], { type: 'region' })

/** Commande de la boutique → corps de requête « createOrderV2 » de CJ. */
export function toCjOrder(order: Order, settings: CjSettings, mapping: CjMapping = configuredMapping()) {
  const logisticName = mapping.logisticNames[order.shippingMethodId]
  if (!logisticName) throw new Error(`Mode d’envoi CJ non renseigné pour « ${order.shippingMethodLabel} ».`)
  const products = order.lines.map((line) => {
    const vid = mapping.variantIds[line.variantId]
    if (!vid) throw new Error(`Variante CJ non renseignée pour le format ${line.label}.`)
    return { vid, quantity: line.quantity }
  })

  const { address1, address2, postalCode, city, region, country } = order.shippingAddress
  const { firstName, lastName, phone, email } = order.customer
  return {
    orderNumber: order.id,
    shippingCountryCode: country,
    shippingCountry: englishCountry.of(country) ?? country,
    // Champ obligatoire chez CJ ; le formulaire ne le demande pas pour tous les pays.
    shippingProvince: (region || city).slice(0, 50),
    shippingCity: city.slice(0, 50),
    shippingZip: postalCode,
    shippingAddress: address1,
    ...(address2 ? { shippingAddress2: address2 } : {}),
    shippingCustomerName: `${firstName} ${lastName}`.slice(0, 50),
    shippingPhone: phone.replace(/[^\d+]/g, '').slice(0, 20),
    // CJ limite l'e-mail à 50 caractères : au-delà, il n'est pas transmis.
    ...(email.length <= 50 ? { email } : {}),
    logisticName,
    fromCountryCode: settings.fromCountryCode,
    payType: settings.payType,
    ...(settings.sandbox ? { isSandbox: 1 } : {}),
    ...(settings.iossType ? { iossType: settings.iossType } : {}),
    ...(settings.iossType === 2 && settings.iossNumber ? { iossNumber: settings.iossNumber } : {}),
    products,
  }
}

interface CjCreatedOrder {
  orderId: string
  orderStatus?: string | null
}

export interface CjOrderDetail {
  orderId: string
  orderNum?: string | null
  orderStatus: string
  trackNumber?: string | null
  trackingProvider?: string | null
  trackingUrl?: string | null
  logisticName?: string | null
  orderAmount?: number | null
  productAmount?: number | null
  postageAmount?: number | null
  isSandbox?: number | null
}

/** États CJ d'une commande pas encore payée. */
const UNPAID_STATUSES = new Set(['CREATED', 'IN_CART', 'UNPAID'])

/** Traduit une erreur CJ en consigne pour l'administrateur (jamais montrée au client). */
export function describeCjError(error: unknown): string {
  if (!(error instanceof CjApiError)) return error instanceof Error ? error.message : String(error)
  switch (error.code) {
    case CJ_ERRORS.insufficientBalance:
      return 'Solde CJ insuffisant : recharger le solde du compte CJ, puis relancer la commande.'
    case CJ_ERRORS.logisticNotFound:
    case CJ_ERRORS.logisticInvalid:
      return 'Mode d’envoi CJ refusé pour cette destination : vérifier cjLogisticName (npm run cj -- livraison).'
    case CJ_ERRORS.variantNotFound:
    case CJ_ERRORS.variantRemoved:
    case CJ_ERRORS.productNotFound:
      return 'Produit ou variante introuvable chez CJ : vérifier cjVariantId (npm run cj -- produit).'
    case CJ_ERRORS.wrongApiKey:
    case CJ_ERRORS.authorizationFailed:
    case CJ_ERRORS.invalidToken:
    case CJ_ERRORS.invalidRefreshToken:
      return 'Clé API CJ refusée : vérifier CJ_API_KEY.'
    case CJ_ERRORS.tooManyRequests:
    case CJ_ERRORS.quotaUsedUp:
      return 'Limite d’appels CJ atteinte : relancer la commande un peu plus tard.'
    default:
      // CJ refuse les envois vers l'UE tant que l'IOSS n'est pas réglé (code générique 1603000).
      if (/IOSS/i.test(error.message)) {
        return 'CJ demande le réglage de TVA à l’import (IOSS) : renseigner CJ_IOSS_TYPE (et CJ_IOSS_NUMBER si 2), puis relancer la commande.'
      }
      return `CJ : ${error.message}${error.code ? ` (code ${error.code})` : ''}`
  }
}

export class CjFulfillmentProvider implements FulfillmentProvider {
  readonly id = 'cj'
  private readonly settings: CjSettings
  private readonly client: CjClient | null
  private readonly mapping: CjMapping

  constructor(settings: CjSettings, client: CjClient | null, mapping: CjMapping = configuredMapping()) {
    this.settings = settings
    this.client = client
    this.mapping = mapping
  }

  /** Réglages lus dans l'environnement ; le jeton CJ est gardé dans le dossier des données. */
  static fromEnv(dataDir: string, env: NodeJS.ProcessEnv = process.env) {
    const settings = readCjSettings(env)
    const interval = Number(env.CJ_MIN_INTERVAL_MS)
    const client = settings.apiKey
      ? new CjClient({
          apiKey: settings.apiKey,
          tokenFile: path.join(dataDir, 'cj-token.json'),
          ...(Number.isFinite(interval) && interval > 0 ? { minIntervalMs: interval } : {}),
        })
      : null
    return new CjFulfillmentProvider(settings, client)
  }

  isConfigured() {
    return this.client !== null && this.missing().length === 0
  }

  /** Ce qui manque encore, en clair (journal de démarrage, npm run cj -- verifier). */
  missing() {
    return missingCjConfig(this.settings, this.mapping)
  }

  private api() {
    if (!this.client) throw new Error('CJ non configuré : renseigner CJ_API_KEY.')
    return this.client
  }

  async createOrder(order: Order): Promise<{ supplierOrderId: string }> {
    const payload = toCjOrder(order, this.settings, this.mapping)
    try {
      const created = await this.api().call<CjCreatedOrder>('POST', '/shopping/order/createOrderV2', { body: payload })
      const status = created.orderStatus ?? ''
      if (this.settings.payType === 2 && UNPAID_STATUSES.has(status)) {
        // Créée mais pas payée : la relance (même numéro) la paiera.
        throw new Error(
          `Commande CJ ${created.orderId} créée mais non payée (état ${status}) : vérifier le solde CJ, puis relancer.`,
        )
      }
      return { supplierOrderId: created.orderId }
    } catch (error) {
      if (error instanceof CjApiError && error.code === CJ_ERRORS.duplicateOrder) {
        // Déjà transmise lors d'une tentative précédente : on reprend celle-ci.
        return this.resume(order.id)
      }
      throw new Error(describeCjError(error))
    }
  }

  /** Reprend une commande déjà créée chez CJ et la paie si elle ne l'est pas encore. */
  private async resume(orderNumber: string): Promise<{ supplierOrderId: string }> {
    try {
      const existing = await this.getOrderDetail(orderNumber)
      if (this.settings.payType === 2 && UNPAID_STATUSES.has(existing.orderStatus)) {
        await this.api().call('POST', '/shopping/balance/payBalance', { body: { orderId: existing.orderId } })
      }
      return { supplierOrderId: existing.orderId }
    } catch (error) {
      throw new Error(describeCjError(error))
    }
  }

  /** Détail d'une commande CJ, par numéro CJ ou par numéro de la boutique. */
  getOrderDetail(orderId: string) {
    return this.api().call<CjOrderDetail>('GET', '/shopping/order/getOrderDetail', { query: { orderId } })
  }

  async getTracking(order: Order): Promise<TrackingInfo | null> {
    const id = order.fulfillment.supplierOrderId
    if (!id) return null
    const detail = await this.getOrderDetail(id)
    const status: TrackingInfo['status'] =
      detail.orderStatus === 'DELIVERED'
        ? 'delivered'
        : detail.orderStatus === 'SHIPPED'
          ? 'shipped'
          : detail.orderStatus === 'CANCELLED'
            ? 'cancelled'
            : 'processing'
    return {
      status,
      carrier: detail.trackingProvider || detail.logisticName || null,
      trackingNumber: detail.trackNumber || null,
      trackingUrl: detail.trackingUrl || null,
    }
  }
}

import nodemailer from 'nodemailer'
import { shop } from '../src/config/shop'
import { site } from '../src/config/site'
import type { Order } from './orders/types'

/**
 * Messages envoyés au client à chaque étape : confirmation de commande une
 * fois le paiement reçu, puis numéro de suivi à l'expédition. Par e-mail quand
 * le serveur d'envoi est réglé (variables SMTP_*, voir .env.example), sinon
 * seulement écrits dans le journal du serveur.
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

export interface MailSettings {
  host: string
  port: number
  user: string
  password: string
  /** Expéditeur affiché, par exemple « Lumikréa <contact@lumikrea.store> ». */
  from: string
}

/** `null` tant que le serveur d'envoi n'est pas réglé. */
export function readMailSettings(env: NodeJS.ProcessEnv = process.env): MailSettings | null {
  const host = env.SMTP_HOST?.trim()
  const user = env.SMTP_USER?.trim()
  const password = env.SMTP_PASSWORD
  if (!host || !user || !password) return null
  const port = Number(env.SMTP_PORT) || 465
  return { host, port, user, password, from: env.MAIL_FROM?.trim() || `${site.brand} <${user}>` }
}

export interface Mail {
  to: string
  subject: string
  text: string
  html: string
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char)

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(site.locale, { style: 'currency', currency }).format(cents / 100)
}

/** Mise en page commune : texte brut, et la même chose en HTML sobre. */
function layout(paragraphs: (string | string[])[], links: { label: string; url: string }[]) {
  const text = [
    ...paragraphs.map((block) => (Array.isArray(block) ? block.join('\n') : block)),
    ...links.map((link) => `${link.label} : ${link.url}`),
    `— ${site.brand}`,
  ].join('\n\n')
  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1f1650;max-width:560px">',
    ...paragraphs.map((block) => `<p>${(Array.isArray(block) ? block : [block]).map(escapeHtml).join('<br>')}</p>`),
    ...links.map((link) => `<p><a href="${escapeHtml(link.url)}" style="color:#b3125f">${escapeHtml(link.label)}</a></p>`),
    `<p>— ${escapeHtml(site.brand)}</p>`,
    '</div>',
  ].join('\n')
  return { text, html }
}

/** Confirmation de commande : récapitulatif, livraison, rétractation et suivi. */
export function orderPaidMail(order: Order, siteUrl: string): Mail {
  const { customer, shippingAddress: address } = order
  const delay = shop.shippingMethods.find((method) => method.id === order.shippingMethodId)?.delay
  const { text, html } = layout(
    [
      `Bonjour ${customer.firstName},`,
      `Merci pour votre commande : nous avons bien reçu votre paiement. Votre numéro de commande est ${order.id}.`,
      [
        'Votre commande :',
        ...order.lines.map((line) => `• Tableau lumineux à dessiner, ${line.label} × ${line.quantity} : ${money(line.totalCents, order.currency)}`),
        `Livraison : ${order.shippingCents === 0 ? 'offerte' : money(order.shippingCents, order.currency)}`,
        `Total TTC : ${money(order.totalCents, order.currency)}`,
      ],
      [
        'Livraison à :',
        `${customer.firstName} ${customer.lastName}`,
        address.address1,
        ...(address.address2 ? [address.address2] : []),
        `${address.postalCode} ${address.city}`,
        ...(delay ? [`Délai de livraison : ${delay}.`] : []),
      ],
      'Dès l’expédition, vous recevrez votre numéro de suivi par e-mail.',
      'Vous disposez de 14 jours à compter de la réception pour changer d’avis : la marche à suivre et le formulaire de rétractation sont sur la page « Livraison et retours ».',
      ...(site.contactEmail ? [`Une question ? Répondez à cet e-mail ou écrivez à ${site.contactEmail}.`] : []),
    ],
    [
      { label: 'Suivre ma commande', url: `${siteUrl}/suivi?commande=${encodeURIComponent(order.id)}` },
      { label: 'Livraison et retours', url: `${siteUrl}/livraison-retours` },
      { label: 'Conditions générales de vente', url: `${siteUrl}/cgv` },
    ],
  )
  return { to: customer.email, subject: `Votre commande ${order.id} est confirmée`, text, html }
}

/** Avis d'expédition, avec le transporteur et le numéro de suivi. */
export function orderShippedMail(order: Order, siteUrl: string): Mail {
  const { carrier, trackingNumber, trackingUrl } = order.fulfillment
  const { text, html } = layout(
    [
      `Bonjour ${order.customer.firstName},`,
      `Bonne nouvelle : votre commande ${order.id} est en route.`,
      [
        ...(carrier ? [`Transporteur : ${carrier}`] : []),
        ...(trackingNumber ? [`Numéro de suivi : ${trackingNumber}`] : ['Le numéro de suivi sera affiché sur la page de suivi dès qu’il sera disponible.']),
      ],
    ],
    [
      ...(trackingUrl ? [{ label: 'Suivre mon colis chez le transporteur', url: trackingUrl }] : []),
      { label: 'Suivre ma commande', url: `${siteUrl}/suivi?commande=${encodeURIComponent(order.id)}` },
    ],
  )
  return { to: order.customer.email, subject: `Votre commande ${order.id} est expédiée`, text, html }
}

/**
 * Envoi par le serveur SMTP de la boîte de contact. `send` est remplaçable
 * pour les tests ; `siteUrl` est l'adresse publique du site, pour les liens.
 */
export function createEmailNotifier(
  settings: MailSettings,
  siteUrl: string,
  send?: (mail: Mail) => Promise<unknown>,
): Notifier {
  let deliver = send
  if (!deliver) {
    const transport = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      // 465 : connexion chiffrée d'emblée ; 587 : chiffrement négocié (STARTTLS).
      secure: settings.port === 465,
      requireTLS: true,
      auth: { user: settings.user, pass: settings.password },
      // Le paiement ne doit pas attendre un serveur d'e-mails qui ne répond pas.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    })
    deliver = (mail) => transport.sendMail({ from: settings.from, replyTo: site.contactEmail ?? settings.user, ...mail })
  }
  const url = siteUrl.replace(/\/+$/, '')
  return {
    async orderPaid(order) {
      await deliver(orderPaidMail(order, url))
      console.info(`[e-mail] confirmation de ${order.id} envoyée`)
    },
    async orderShipped(order) {
      await deliver(orderShippedMail(order, url))
      console.info(`[e-mail] avis d’expédition de ${order.id} envoyé`)
    },
  }
}

import { describe, expect, it, vi } from 'vitest'
import { createDefaultDeps } from './app'
import { readConfig } from './config'
import { consoleNotifier, createEmailNotifier, orderPaidMail, orderShippedMail, readMailSettings, type Mail } from './notify'
import type { Order } from './orders/types'

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 'LK-ABC234',
    accessKey: 'cle',
    createdAt: '2026-10-13T10:00:00.000Z',
    updatedAt: '2026-10-13T10:00:00.000Z',
    status: 'paid',
    customer: { email: 'camille@exemple.fr', phone: '0612345678', firstName: 'Camille', lastName: 'Martin <b>' },
    shippingAddress: { address1: '12 rue des Lilas', address2: 'Bât. B', postalCode: '75011', city: 'Paris', region: '', country: 'FR' },
    shippingMethodId: 'standard',
    shippingMethodLabel: 'Livraison standard à domicile',
    lines: [{ variantId: '20x20', label: '20 × 20 cm', quantity: 2, unitPriceCents: 3290, totalCents: 6580 }],
    subtotalCents: 6580,
    shippingCents: 0,
    totalCents: 6580,
    currency: 'EUR',
    payment: { provider: 'mepaye', reference: 'pay_1', paidAt: '2026-10-13T10:01:00.000Z' },
    fulfillment: { provider: 'cj', supplierOrderId: 'CJ-1', carrier: 'YunExpress', trackingNumber: 'YT123', trackingUrl: null, lastSyncAt: null, error: null },
    history: [],
    ...overrides,
  }
}

const SITE = 'https://lumikrea.store'

describe('e-mails au client', () => {
  it('confirme la commande : récapitulatif, adresse, rétractation, liens', () => {
    const mail = orderPaidMail(order(), SITE)
    expect(mail.to).toBe('camille@exemple.fr')
    expect(mail.subject).toBe('Votre commande LK-ABC234 est confirmée')
    expect(mail.text).toContain('20 × 20 cm × 2')
    expect(mail.text).toMatch(/Total TTC : 65,80\s€/)
    expect(mail.text).toContain('Livraison : offerte')
    expect(mail.text).toContain('75011 Paris')
    expect(mail.text).toContain('14 jours')
    expect(mail.text).toContain('https://lumikrea.store/suivi?commande=LK-ABC234')
    expect(mail.text).toContain('https://lumikrea.store/cgv')
    // Ce que le client a saisi n'est jamais interprété comme du HTML.
    expect(mail.html).toContain('Martin &lt;b&gt;')
    expect(mail.html).not.toContain('<b>')
  })

  it('annonce l’expédition avec le transporteur et le numéro de suivi', () => {
    const mail = orderShippedMail(order(), SITE)
    expect(mail.subject).toBe('Votre commande LK-ABC234 est expédiée')
    expect(mail.text).toContain('Transporteur : YunExpress')
    expect(mail.text).toContain('Numéro de suivi : YT123')
  })

  it('envoie les deux messages par le serveur d’envoi', async () => {
    const send = vi.fn(async (_mail: Mail) => {})
    const settings = readMailSettings({ SMTP_HOST: 'mail.test', SMTP_USER: 'contact@lumikrea.store', SMTP_PASSWORD: 'x' })!
    const notifier = createEmailNotifier(settings, `${SITE}/`, send)
    await notifier.orderPaid(order())
    await notifier.orderShipped(order())
    expect(send.mock.calls.map(([mail]) => mail.subject)).toEqual([
      'Votre commande LK-ABC234 est confirmée',
      'Votre commande LK-ABC234 est expédiée',
    ])
    expect(send.mock.calls[0][0].text).toContain('https://lumikrea.store/suivi')
  })

  it('n’envoie d’e-mails que si le serveur d’envoi est réglé', () => {
    expect(readMailSettings({})).toBeNull()
    expect(readMailSettings({ SMTP_HOST: 'h', SMTP_USER: 'u' })).toBeNull()
    expect(readMailSettings({ SMTP_HOST: 'h', SMTP_USER: 'u@x.fr', SMTP_PASSWORD: 'p' })).toMatchObject({ port: 465, from: expect.stringContaining('<u@x.fr>') })
    const without = { PUBLIC_URL: 'https://lumikrea.store' }
    expect(createDefaultDeps(readConfig(without, 'live'), without).notifier).toBe(consoleNotifier)
    const withMail = { ...without, SMTP_HOST: 'h', SMTP_USER: 'u@x.fr', SMTP_PASSWORD: 'p' }
    expect(createDefaultDeps(readConfig(withMail, 'live'), withMail).notifier).not.toBe(consoleNotifier)
  })
})

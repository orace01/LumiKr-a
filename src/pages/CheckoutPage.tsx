import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Field, SelectField } from '../components/Field'
import { OrderSummary } from '../components/OrderSummary'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Link } from '../components/Link'
import { site } from '../config/site'
import { useLocation } from '../router'
import { api, ApiError } from '../shop/api'
import { useCart } from '../shop/useCart'
import { loadCheckoutDraft, saveCheckoutDraft } from '../shop/checkoutDraft'
import { quote } from '../shop/pricing'
import { useShop } from '../shop/useShop'
import type { CheckoutCustomer, FieldErrors } from '../shop/types'
import { normalizeCustomer, validateCustomer } from '../shop/validation'
import './CheckoutPage.css'

type TextField = Exclude<keyof CheckoutCustomer, 'acceptTerms'>

const EMPTY: CheckoutCustomer = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  postalCode: '',
  city: '',
  region: '',
  country: '',
  shippingMethodId: '',
  acceptTerms: false,
}

// Ordre des champs dans le formulaire, pour la liste des erreurs.
const FIELD_LABELS: [keyof FieldErrors, string][] = [
  ['email', 'Adresse e-mail'],
  ['phone', 'Téléphone'],
  ['firstName', 'Prénom'],
  ['lastName', 'Nom'],
  ['address1', 'Adresse'],
  ['postalCode', 'Code postal'],
  ['city', 'Ville'],
  ['country', 'Pays'],
  ['shippingMethodId', 'Mode de livraison'],
  ['acceptTerms', 'Conditions générales de vente'],
  ['lines', 'Panier'],
]

export function CheckoutPage() {
  useDocumentTitle('Votre commande')
  const { search } = useLocation()
  const cancelled = new URLSearchParams(search).has('annule')
  const cart = useCart()
  const { info, status, money, saleOpen } = useShop()

  const [customer, setCustomer] = useState<CheckoutCustomer>(() => ({ ...EMPTY, ...loadCheckoutDraft() }))
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const alertRef = useRef<HTMLDivElement>(null)

  useEffect(() => saveCheckoutDraft(customer), [customer])

  // Pays et mode de livraison : le premier proposé tant que le client n'a rien choisi.
  const form: CheckoutCustomer = {
    ...customer,
    country: info?.countries.some((country) => country.code === customer.country)
      ? customer.country
      : (info?.countries[0]?.code ?? ''),
    shippingMethodId: info?.shippingMethods.some((method) => method.id === customer.shippingMethodId)
      ? customer.shippingMethodId
      : (info?.shippingMethods[0]?.id ?? ''),
  }

  const allowed = useMemo(
    () =>
      info
        ? {
            countries: info.countries.map((country) => country.code),
            shippingMethodIds: info.shippingMethods.map((method) => method.id),
          }
        : null,
    [info],
  )

  // Après une première tentative, les erreurs se mettent à jour pendant la saisie.
  const clientErrors = submitted && allowed ? validateCustomer(normalizeCustomer(form), allowed) : {}
  const errors: FieldErrors = { ...serverErrors, ...clientErrors }
  const priced = info ? quote(info, cart.lines, form.shippingMethodId || undefined) : null

  const focusAlert = () => requestAnimationFrame(() => alertRef.current?.focus())

  const update = (field: TextField) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value
    setCustomer((current) => ({ ...current, [field]: value }))
    setServerErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setFormError(null)
    if (!info || !allowed || sending) return

    const normalized = normalizeCustomer(form)
    if (Object.keys(validateCustomer(normalized, allowed)).length > 0) {
      focusAlert()
      return
    }

    setSending(true)
    try {
      const { redirectUrl } = await api.checkout({ customer: normalized, lines: cart.lines })
      // Direction la page de paiement du prestataire. Le panier est vidé
      // seulement quand le paiement est confirmé (page de confirmation).
      window.location.assign(redirectUrl)
    } catch (error) {
      setSending(false)
      if (error instanceof ApiError) {
        setServerErrors(error.errors)
        setFormError(error.message)
      } else {
        setFormError('Une erreur est survenue. Réessayez dans quelques instants.')
      }
      focusAlert()
    }
  }

  if (cart.lines.length === 0) {
    return (
      <div className="container checkout-empty">
        <h1 className="checkout__title">Votre panier est vide.</h1>
        <p className="lede">Choisissez d’abord le format de votre tableau.</p>
        <Link to="/#formats" className="btn btn--primary">
          Choisir un format
        </Link>
      </div>
    )
  }

  const errorList = FIELD_LABELS.filter(([field]) => errors[field])
  const shippingMethods = info?.shippingMethods ?? []
  const canPay = saleOpen && priced?.ok === true

  return (
    <div className="container checkout">
      <div className="checkout__main">
        <h1 className="checkout__title">Votre commande</h1>

        {cancelled && (
          <p className="checkout__banner">
            Paiement annulé : rien n’a été débité. Votre panier et vos informations sont conservés, vous pouvez
            réessayer.
          </p>
        )}
        {status === 'error' && (
          <p className="checkout__banner checkout__banner--alert" role="alert">
            La boutique est momentanément indisponible. Réessayez dans quelques instants.
          </p>
        )}
        {status === 'ready' && !saleOpen && (
          <p className="checkout__banner">La vente en ligne ouvre bientôt : la commande n’est pas encore possible.</p>
        )}

        {(formError || (submitted && errorList.length > 0)) && (
          <div ref={alertRef} className="checkout__errors" tabIndex={-1} role="alert">
            <p className="checkout__errors-title">{formError ?? 'Certaines informations sont à corriger :'}</p>
            {errorList.length > 0 && (
              <ul>
                {errorList.map(([field, label]) => (
                  <li key={field}>
                    {field === 'lines' ? (
                      <>
                        {label} : {errors.lines}
                      </>
                    ) : (
                      <a href={`#champ-${field}`}>
                        {label} : {errors[field]}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form className="checkout__form" noValidate onSubmit={onSubmit}>
          <section className="checkout__section" aria-labelledby="etape-contact">
            <h2 id="etape-contact" className="checkout__step">
              <span aria-hidden="true">1</span> Vos coordonnées
            </h2>
            <Field
              name="email"
              label="Adresse e-mail"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              hint="Pour retrouver et suivre votre commande."
            />
            <Field
              name="phone"
              label="Téléphone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={update('phone')}
              error={errors.phone}
              hint="Transmis au transporteur, uniquement pour la livraison."
            />
          </section>

          <section className="checkout__section" aria-labelledby="etape-adresse">
            <h2 id="etape-adresse" className="checkout__step">
              <span aria-hidden="true">2</span> Adresse de livraison
            </h2>
            <div className="checkout__row">
              <Field
                name="firstName"
                label="Prénom"
                autoComplete="given-name"
                value={form.firstName}
                onChange={update('firstName')}
                error={errors.firstName}
              />
              <Field
                name="lastName"
                label="Nom"
                autoComplete="family-name"
                value={form.lastName}
                onChange={update('lastName')}
                error={errors.lastName}
              />
            </div>
            <Field
              name="address1"
              label="Adresse"
              autoComplete="address-line1"
              value={form.address1}
              onChange={update('address1')}
              error={errors.address1}
              hint="Numéro et nom de la rue."
            />
            <Field
              name="address2"
              label="Complément d’adresse"
              optional
              autoComplete="address-line2"
              value={form.address2}
              onChange={update('address2')}
              hint="Bâtiment, étage, code d’accès…"
            />
            <div className="checkout__row checkout__row--zip">
              <Field
                name="postalCode"
                label="Code postal"
                autoComplete="postal-code"
                value={form.postalCode}
                onChange={update('postalCode')}
                error={errors.postalCode}
              />
              <Field
                name="city"
                label="Ville"
                autoComplete="address-level2"
                value={form.city}
                onChange={update('city')}
                error={errors.city}
              />
            </div>
            <div className="checkout__row">
              <Field
                name="region"
                label="Région ou province"
                optional
                autoComplete="address-level1"
                value={form.region}
                onChange={update('region')}
              />
              <SelectField
                name="country"
                label="Pays"
                autoComplete="country"
                value={form.country}
                onChange={update('country')}
                error={errors.country}
              >
                {(info?.countries ?? []).map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </SelectField>
            </div>
          </section>

          <fieldset className="checkout__section" aria-describedby={errors.shippingMethodId ? 'livraison-erreur' : undefined}>
            <legend id="champ-shippingMethodId" className="checkout__step" tabIndex={-1}>
              <span aria-hidden="true">3</span> Livraison
            </legend>
            {shippingMethods.map((method) => (
              <label key={method.id} className="checkout__choice">
                <input
                  type="radio"
                  name="shippingMethodId"
                  value={method.id}
                  checked={form.shippingMethodId === method.id}
                  onChange={update('shippingMethodId')}
                />
                <span className="checkout__choice-text">
                  <span className="checkout__choice-title">{method.label}</span>
                  {method.delay && <span className="checkout__choice-hint">{method.delay}</span>}
                </span>
                <span className="checkout__choice-price">
                  {method.priceCents === null ? 'À confirmer' : method.priceCents === 0 ? 'Offerte' : money(method.priceCents)}
                </span>
              </label>
            ))}
            {errors.shippingMethodId && (
              <p id="livraison-erreur" className="field__error">
                {errors.shippingMethodId}
              </p>
            )}
          </fieldset>

          <section className="checkout__section" aria-labelledby="etape-paiement">
            <h2 id="etape-paiement" className="checkout__step">
              <span aria-hidden="true">4</span> Paiement
            </h2>
            <div className="checkout__payment">
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
                <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p>
                Vous allez être redirigé vers la page sécurisée
                {info?.paymentProviderName ? ` de ${info.paymentProviderName}` : ' de notre prestataire de paiement'}.
                Vos coordonnées bancaires n’y sont saisies que chez lui : elles ne passent jamais par ce site.
              </p>
            </div>

            <div className={`checkout__terms${errors.acceptTerms ? ' field--error' : ''}`}>
              <input
                id="champ-acceptTerms"
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(event) => setCustomer((current) => ({ ...current, acceptTerms: event.target.checked }))}
                aria-invalid={errors.acceptTerms ? true : undefined}
                aria-describedby={errors.acceptTerms ? 'cgv-erreur' : undefined}
              />
              <label htmlFor="champ-acceptTerms">
                J’ai lu et j’accepte les{' '}
                {site.legalPages.some((page) => page.path === '/cgv') ? (
                  <a href="/cgv" target="_blank" rel="noopener">
                    conditions générales de vente
                  </a>
                ) : (
                  'conditions générales de vente'
                )}
                .
              </label>
              {errors.acceptTerms && (
                <p id="cgv-erreur" className="field__error">
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            <button type="submit" className="btn btn--primary checkout__pay" disabled={!canPay || sending} aria-busy={sending}>
              {sending ? 'Redirection vers le paiement…' : priced?.ok ? `Payer ${money(priced.totalCents)}` : 'Payer'}
            </button>
            <p className="checkout__fineprint">
              En cliquant sur « Payer », vous passez une commande avec obligation de paiement.
            </p>
          </section>
        </form>
      </div>

      <aside className={`checkout__aside${summaryOpen ? ' is-open' : ''}`} aria-label="Récapitulatif de la commande">
        <button
          type="button"
          className="checkout__summary-toggle"
          aria-expanded={summaryOpen}
          aria-controls="recapitulatif"
          onClick={() => setSummaryOpen((open) => !open)}
        >
          <span>{summaryOpen ? 'Masquer le récapitulatif' : 'Afficher le récapitulatif'}</span>
          <span className="checkout__summary-total">{priced?.ok ? money(priced.totalCents) : ''}</span>
        </button>
        <div id="recapitulatif" className="checkout__summary">
          <h2 className="checkout__summary-title">Récapitulatif</h2>
          {priced?.ok ? (
            <OrderSummary
              lines={priced.lines}
              subtotalCents={priced.subtotalCents}
              shippingCents={priced.shippingCents}
              totalCents={priced.totalCents}
              money={money}
            />
          ) : (
            <p className="checkout__summary-note">
              {status === 'loading' ? 'Calcul des montants…' : (priced && !priced.ok ? priced.reason : 'Montants indisponibles.')}
            </p>
          )}
          <button type="button" className="checkout__edit" onClick={cart.open}>
            Modifier le panier
          </button>
        </div>
      </aside>
    </div>
  )
}

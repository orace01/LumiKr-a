import { describe, expect, it } from 'vitest'
import { normalizeCustomer, validateCustomer } from './validation'

const allowed = { countries: ['FR'], shippingMethodIds: ['standard'] }

const valid = {
  email: '  Camille.Martin@Exemple.fr ',
  phone: '06 12 34 56 78',
  firstName: 'Camille',
  lastName: 'Martin',
  address1: '12   rue des Lilas',
  address2: '',
  postalCode: '75011',
  city: 'Paris',
  region: '',
  country: 'fr',
  shippingMethodId: 'standard',
  acceptTerms: true,
}

describe('normalizeCustomer', () => {
  it('nettoie les espaces et la casse', () => {
    const customer = normalizeCustomer(valid)
    expect(customer.email).toBe('camille.martin@exemple.fr')
    expect(customer.address1).toBe('12 rue des Lilas')
    expect(customer.country).toBe('FR')
  })

  it('ignore les valeurs qui ne sont pas du texte', () => {
    const customer = normalizeCustomer({ email: 42, acceptTerms: 'true' })
    expect(customer.email).toBe('')
    expect(customer.acceptTerms).toBe(false)
  })
})

describe('validateCustomer', () => {
  it('accepte une commande complète', () => {
    expect(validateCustomer(normalizeCustomer(valid), allowed)).toEqual({})
  })

  it('signale chaque champ manquant', () => {
    const errors = validateCustomer(normalizeCustomer({}), allowed)
    expect(Object.keys(errors).sort()).toEqual(
      ['acceptTerms', 'address1', 'city', 'country', 'email', 'firstName', 'lastName', 'phone', 'postalCode', 'shippingMethodId'].sort(),
    )
  })

  it('refuse un e-mail incomplet, un pays non livré et des CGV non acceptées', () => {
    const errors = validateCustomer(
      normalizeCustomer({ ...valid, email: 'camille@exemple', country: 'BE', acceptTerms: false }),
      allowed,
    )
    expect(errors.email).toBeDefined()
    expect(errors.country).toBeDefined()
    expect(errors.acceptTerms).toBeDefined()
  })
})

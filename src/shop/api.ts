import type { CheckoutRequest, CheckoutResponse, FieldErrors, PublicOrder, ShopInfo } from './types'

/** Erreur renvoyée par l'API, avec le code HTTP et les champs à corriger. */
export class ApiError extends Error {
  readonly status: number
  readonly errors: FieldErrors

  constructor(status: number, message: string, errors: FieldErrors = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
    })
  } catch {
    throw new ApiError(0, 'Connexion impossible. Vérifiez votre connexion internet et réessayez.')
  }
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const failure = (body ?? {}) as { message?: string; errors?: FieldErrors }
    throw new ApiError(response.status, failure.message ?? 'Une erreur est survenue. Réessayez dans quelques instants.', failure.errors)
  }
  return body as T
}

export const api = {
  shop: () => request<ShopInfo>('/api/shop'),
  checkout: (payload: CheckoutRequest) =>
    request<CheckoutResponse>('/api/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  order: (id: string, key: string) =>
    request<PublicOrder>(`/api/orders/${encodeURIComponent(id)}?cle=${encodeURIComponent(key)}`),
  lookup: (orderId: string, email: string) =>
    request<PublicOrder>('/api/orders/lookup', { method: 'POST', body: JSON.stringify({ orderId, email }) }),
  demoPayment: (reference: string) =>
    request<{ orderId: string; amountCents: number; currency: string }>(`/api/demo/payments/${encodeURIComponent(reference)}`),
  completeDemoPayment: (reference: string, outcome: 'paid' | 'failed' | 'cancelled') =>
    request<{ redirectUrl: string }>(`/api/demo/payments/${encodeURIComponent(reference)}`, {
      method: 'POST',
      body: JSON.stringify({ outcome }),
    }),
}

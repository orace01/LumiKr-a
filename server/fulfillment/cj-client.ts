import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Client de l'API CJdropshipping 2.0 :
// https://developers.cjdropshipping.com/en/api/api2/
// Il gère le jeton d'accès, le rythme des appels et les erreurs ; les appels
// métier (commande, suivi, produit) sont dans cj.ts et cli.ts.

const BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1'

/** Codes d'erreur CJ utilisés ici (annexe « Global Error Codes »). */
export const CJ_ERRORS = {
  invalidToken: 1600001,
  emptyToken: 1600002,
  invalidRefreshToken: 1600003,
  authorizationFailed: 1600004,
  wrongApiKey: 1600005,
  tooManyRequests: 1600200,
  quotaUsedUp: 1600201,
  productNotFound: 1602001,
  variantNotFound: 1602002,
  variantRemoved: 1602003,
  duplicateOrder: 1603003,
  insufficientBalance: 1604000,
  logisticNotFound: 1605000,
  logisticInvalid: 1605001,
} as const

export class CjApiError extends Error {
  /** Code d'erreur CJ, ou `null` pour une erreur réseau ou HTTP. */
  readonly code: number | null

  constructor(code: number | null, message: string) {
    super(message)
    this.code = code
  }
}

interface CjEnvelope<T> {
  code: number
  result: boolean
  message: string
  data: T
  requestId?: string
}

interface CjToken {
  accessToken: string
  accessTokenExpiryDate: string
  refreshToken: string
  refreshTokenExpiryDate: string
  openId?: number | string
}

export interface CjClientOptions {
  apiKey: string
  /** Fichier où garder le jeton entre deux redémarrages ; `null` : en mémoire seulement. */
  tokenFile: string | null
  /**
   * Intervalle minimal entre deux appels. CJ limite un compte gratuit à un
   * appel par seconde (davantage selon le niveau du compte).
   */
  minIntervalMs?: number
  fetch?: typeof fetch
  baseUrl?: string
  /** Attente avant de réessayer un appel refusé pour excès de requêtes. */
  retryDelayMs?: number
}

type Method = 'GET' | 'POST' | 'PATCH'

/** Le jeton est renouvelé une heure avant son expiration annoncée. */
const EXPIRY_MARGIN_MS = 60 * 60_000

function stillValid(expiry: string | undefined) {
  const time = expiry ? Date.parse(expiry) : Number.NaN
  return Number.isFinite(time) && time - EXPIRY_MARGIN_MS > Date.now()
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class CjClient {
  private readonly options: Required<Omit<CjClientOptions, 'tokenFile'>> & { tokenFile: string | null }
  private token: CjToken | null = null
  private tokenLoaded = false
  private pendingToken: Promise<CjToken> | null = null
  private queue: Promise<unknown> = Promise.resolve()
  private lastCallAt = 0

  constructor(options: CjClientOptions) {
    this.options = {
      minIntervalMs: 1100,
      fetch: globalThis.fetch.bind(globalThis),
      baseUrl: BASE_URL,
      retryDelayMs: 1500,
      ...options,
    }
  }

  /** Identifiant du compte CJ, connu une fois le jeton obtenu. */
  get openId() {
    return this.token?.openId ?? null
  }

  get tokenExpiry() {
    return this.token?.accessTokenExpiryDate ?? null
  }

  /** Appel authentifié. Renvoie `data` ; lève une `CjApiError` sinon. */
  async call<T>(method: Method, endpoint: string, options: { query?: Record<string, string>; body?: unknown } = {}): Promise<T> {
    let token = await this.ensureToken()
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.send<T>(method, endpoint, { ...options, token: token.accessToken })
      } catch (error) {
        if (!(error instanceof CjApiError)) throw error
        // Jeton refusé (révoqué, expiré plus tôt que prévu) : un seul nouvel essai.
        if (attempt === 0 && (error.code === CJ_ERRORS.invalidToken || error.code === CJ_ERRORS.emptyToken)) {
          this.token = null
          token = await this.ensureToken({ forceNew: true })
          continue
        }
        if (error.code === CJ_ERRORS.tooManyRequests && attempt < 2) {
          await sleep(this.options.retryDelayMs * (attempt + 1))
          continue
        }
        throw error
      }
    }
  }

  /** Obtient un jeton valide : celui en mémoire, celui du fichier, un renouvelé ou un neuf. */
  async ensureToken({ forceNew = false } = {}): Promise<CjToken> {
    if (!forceNew) {
      await this.loadToken()
      if (this.token && stillValid(this.token.accessTokenExpiryDate)) return this.token
    }
    // Plusieurs appels simultanés partagent la même demande de jeton.
    this.pendingToken ??= this.obtainToken(forceNew).finally(() => {
      this.pendingToken = null
    })
    return this.pendingToken
  }

  private async obtainToken(forceNew: boolean): Promise<CjToken> {
    const previous = this.token
    let fresh: CjToken | null = null
    if (!forceNew && previous && stillValid(previous.refreshTokenExpiryDate)) {
      fresh = await this.send<CjToken>('POST', '/authentication/refreshAccessToken', {
        body: { refreshToken: previous.refreshToken },
      }).catch(() => null)
    }
    fresh ??= await this.send<CjToken>('POST', '/authentication/getAccessToken', { body: { apiKey: this.options.apiKey } })
    this.token = { ...fresh, openId: fresh.openId ?? previous?.openId }
    await this.saveToken()
    return this.token
  }

  private async loadToken() {
    if (this.tokenLoaded) return
    this.tokenLoaded = true
    if (!this.options.tokenFile) return
    try {
      const saved = JSON.parse(await readFile(this.options.tokenFile, 'utf8')) as CjToken
      if (saved?.accessToken) this.token = saved
    } catch {
      // Pas encore de jeton enregistré.
    }
  }

  private async saveToken() {
    const file = this.options.tokenFile
    if (!file || !this.token) return
    try {
      await mkdir(path.dirname(file), { recursive: true })
      await writeFile(file, JSON.stringify(this.token, null, 2), { encoding: 'utf8', mode: 0o600 })
      await chmod(file, 0o600)
    } catch (error) {
      console.warn('[cj] jeton non enregistré sur le disque', error)
    }
  }

  /** Une requête HTTP, en respectant l'intervalle minimal entre deux appels. */
  private send<T>(method: Method, endpoint: string, options: { query?: Record<string, string>; body?: unknown; token?: string }): Promise<T> {
    const run = async () => {
      const wait = this.lastCallAt + this.options.minIntervalMs - Date.now()
      if (wait > 0) await sleep(wait)
      this.lastCallAt = Date.now()

      const url = new URL(this.options.baseUrl + endpoint)
      for (const [key, value] of Object.entries(options.query ?? {})) url.searchParams.set(key, value)
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (options.token) headers['CJ-Access-Token'] = options.token
      if (options.body !== undefined) headers['Content-Type'] = 'application/json'

      let response: Response
      try {
        response = await this.options.fetch(url, {
          method,
          headers,
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
          signal: AbortSignal.timeout(20_000),
        })
      } catch (error) {
        throw new CjApiError(null, `CJ injoignable : ${error instanceof Error ? error.message : String(error)}`)
      }

      const envelope = (await response.json().catch(() => null)) as CjEnvelope<T> | null
      if (!envelope || typeof envelope.code !== 'number') {
        throw new CjApiError(null, `Réponse inattendue de CJ (HTTP ${response.status}).`)
      }
      if (envelope.code !== 200 || envelope.result === false) {
        throw new CjApiError(envelope.code, envelope.message || `Erreur CJ ${envelope.code}`)
      }
      return envelope.data
    }
    // Les appels passent un par un.
    const next = this.queue.then(run, run)
    this.queue = next.catch(() => undefined)
    return next
  }
}

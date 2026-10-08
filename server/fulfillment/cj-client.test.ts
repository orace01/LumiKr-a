import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { CJ_ERRORS, CjApiError, CjClient } from './cj-client'

const FUTURE = new Date(Date.now() + 100 * 86_400_000).toISOString()
const PAST = new Date(Date.now() - 86_400_000).toISOString()

const token = (n: number, expiry = FUTURE) => ({
  accessToken: `access-${n}`,
  accessTokenExpiryDate: expiry,
  refreshToken: `refresh-${n}`,
  refreshTokenExpiryDate: FUTURE,
  openId: 42,
})

const ok = (data: unknown) => ({ code: 200, result: true, message: 'Success', data })
const fail = (code: number, message = 'erreur') => ({ code, result: false, message, data: null })

/** Faux serveur CJ : chaque requête est enregistrée, la réponse vient de `handler`. */
function fakeCj(handler: (endpoint: string, body: unknown, accessToken: string | null) => unknown) {
  const calls: { endpoint: string; body: unknown; token: string | null; at: number }[] = []
  const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input))
    const endpoint = url.pathname.replace('/api2.0/v1', '') + url.search
    const body = init?.body ? JSON.parse(String(init.body)) : undefined
    const accessToken = (init?.headers as Record<string, string> | undefined)?.['CJ-Access-Token'] ?? null
    calls.push({ endpoint, body, token: accessToken, at: Date.now() })
    return new Response(JSON.stringify(handler(endpoint, body, accessToken)), { status: 200 })
  }) as typeof globalThis.fetch
  return { fetch, calls }
}

const dirs: string[] = []
afterEach(async () => {
  for (const dir of dirs.splice(0)) await rm(dir, { recursive: true, force: true })
})

describe('CjClient', () => {
  it('demande un jeton une seule fois et le transmet dans CJ-Access-Token', async () => {
    const cj = fakeCj((endpoint) => (endpoint.startsWith('/authentication/getAccessToken') ? ok(token(1)) : ok({ pong: true })))
    const client = new CjClient({ apiKey: 'CJ1@api@x', tokenFile: null, minIntervalMs: 0, fetch: cj.fetch })

    await Promise.all([client.call('GET', '/a'), client.call('GET', '/b')])
    await client.call('GET', '/c')

    expect(cj.calls.filter((call) => call.endpoint.startsWith('/authentication')).map((call) => call.body)).toEqual([
      { apiKey: 'CJ1@api@x' },
    ])
    expect(cj.calls.filter((call) => !call.endpoint.startsWith('/authentication')).every((call) => call.token === 'access-1')).toBe(true)
    expect(client.openId).toBe(42)
  })

  it('renvoie `data` et lève une CjApiError avec le code CJ en cas d’échec', async () => {
    const cj = fakeCj((endpoint) =>
      endpoint.startsWith('/authentication') ? ok(token(1)) : endpoint === '/ok' ? ok({ value: 7 }) : fail(CJ_ERRORS.insufficientBalance, 'Balance is insufficient'),
    )
    const client = new CjClient({ apiKey: 'k', tokenFile: null, minIntervalMs: 0, fetch: cj.fetch })
    expect(await client.call('GET', '/ok')).toEqual({ value: 7 })
    const attempt = client.call('POST', '/ko', { body: {} })
    await expect(attempt).rejects.toBeInstanceOf(CjApiError)
    await expect(attempt).rejects.toMatchObject({ code: CJ_ERRORS.insufficientBalance })
  })

  it('redemande un jeton une fois si CJ refuse le jeton en cours', async () => {
    let issued = 0
    const cj = fakeCj((endpoint, _body, accessToken) => {
      if (endpoint.startsWith('/authentication/getAccessToken')) return ok(token(++issued))
      return accessToken === 'access-1' ? fail(CJ_ERRORS.invalidToken) : ok('fait')
    })
    const client = new CjClient({ apiKey: 'k', tokenFile: null, minIntervalMs: 0, fetch: cj.fetch })
    expect(await client.call('GET', '/x')).toBe('fait')
    expect(issued).toBe(2)
  })

  it('renouvelle un jeton expiré avec le refreshToken', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'cj-'))
    dirs.push(dir)
    const file = path.join(dir, 'cj-token.json')
    const first = fakeCj((endpoint) => (endpoint.startsWith('/authentication') ? ok(token(1, PAST)) : ok(null)))
    await new CjClient({ apiKey: 'k', tokenFile: file, minIntervalMs: 0, fetch: first.fetch }).call('GET', '/x')

    const second = fakeCj((endpoint) => (endpoint.startsWith('/authentication/refreshAccessToken') ? ok(token(2)) : ok(null)))
    await new CjClient({ apiKey: 'k', tokenFile: file, minIntervalMs: 0, fetch: second.fetch }).call('GET', '/x')
    expect(second.calls[0]).toMatchObject({ endpoint: '/authentication/refreshAccessToken', body: { refreshToken: 'refresh-1' } })
  })

  it('garde le jeton sur le disque, lisible par le seul propriétaire', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'cj-'))
    dirs.push(dir)
    const file = path.join(dir, 'cj-token.json')
    const first = fakeCj((endpoint) => (endpoint.startsWith('/authentication') ? ok(token(1)) : ok(null)))
    await new CjClient({ apiKey: 'k', tokenFile: file, minIntervalMs: 0, fetch: first.fetch }).call('GET', '/x')

    expect(JSON.parse(await readFile(file, 'utf8')).accessToken).toBe('access-1')
    expect((await stat(file)).mode & 0o777).toBe(0o600)

    // Un nouveau démarrage réutilise le jeton enregistré, sans s'authentifier.
    const second = fakeCj(() => ok(null))
    await new CjClient({ apiKey: 'k', tokenFile: file, minIntervalMs: 0, fetch: second.fetch }).call('GET', '/x')
    expect(second.calls.map((call) => call.endpoint)).toEqual(['/x'])
    expect(second.calls[0].token).toBe('access-1')
  })

  it('espace les appels de l’intervalle demandé', async () => {
    const cj = fakeCj((endpoint) => (endpoint.startsWith('/authentication') ? ok(token(1)) : ok(null)))
    const client = new CjClient({ apiKey: 'k', tokenFile: null, minIntervalMs: 60, fetch: cj.fetch })
    await Promise.all([client.call('GET', '/a'), client.call('GET', '/b'), client.call('GET', '/c')])
    const times = cj.calls.map((call) => call.at)
    for (let index = 1; index < times.length; index++) expect(times[index] - times[index - 1]).toBeGreaterThanOrEqual(55)
  })

  it('réessaie après un refus pour excès de requêtes', async () => {
    let refused = 0
    const cj = fakeCj((endpoint) => {
      if (endpoint.startsWith('/authentication')) return ok(token(1))
      return refused++ === 0 ? fail(CJ_ERRORS.tooManyRequests, 'Too much request') : ok('fait')
    })
    const client = new CjClient({ apiKey: 'k', tokenFile: null, minIntervalMs: 0, retryDelayMs: 5, fetch: cj.fetch })
    expect(await client.call('GET', '/x')).toBe('fait')
  })
})

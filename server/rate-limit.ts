/**
 * Limite le nombre de requêtes par adresse IP sur une fenêtre de temps. Garde
 * l'état en mémoire : suffisant pour un seul serveur.
 */
export function createRateLimiter({ max, windowMs }: { max: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return function allow(key: string): boolean {
    const now = Date.now()
    if (hits.size > 10_000) for (const [entry, value] of hits) if (value.resetAt <= now) hits.delete(entry)

    const current = hits.get(key)
    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return true
    }
    current.count += 1
    return current.count <= max
  }
}

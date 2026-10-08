// Assemble le déploiement Vercel (« Build Output API », .vercel/output) après
// `npm run build` : le site construit (dist/) en fichiers statiques, et le
// serveur (dist-server/vercel.js, dépendances incluses) en une fonction qui
// répond à /api/*. Lancé par `npm run build:vercel` (voir vercel.json).
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'

const OUT = '.vercel/output'
const FUNCTION = `${OUT}/functions/api.func`

await rm(OUT, { recursive: true, force: true })
await mkdir(FUNCTION, { recursive: true })

await cp('dist', `${OUT}/static`, { recursive: true })
await cp('dist-server', FUNCTION, { recursive: true })

const json = (file, data) => writeFile(file, `${JSON.stringify(data, null, 2)}\n`)

await json(`${FUNCTION}/package.json`, { type: 'module' })
await json(`${FUNCTION}/.vc-config.json`, {
  runtime: 'nodejs22.x',
  handler: 'vercel.js',
  launcherType: 'Nodejs',
  shouldAddHelpers: false,
  supportsResponseStreaming: true,
  // Une commande transmise à CJ enchaîne quelques appels espacés d'une seconde.
  maxDuration: 60,
})

await json(`${OUT}/config.json`, {
  version: 3,
  routes: [
    // Fichiers à nom unique (assets/…-hash.js) : mis en cache longtemps.
    {
      src: '^/assets/(.*)$',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      continue: true,
    },
    { src: '^/api(?:/.*)?$', dest: '/api' },
    { handle: 'filesystem' },
    { src: '^/assets/.*$', status: 404 },
    // Application d'une seule page : toutes les autres adresses renvoient index.html.
    { src: '^/.*$', dest: '/index.html' },
  ],
  // Suivi des colis une fois par jour (maximum de l'offre gratuite de Vercel) ;
  // le suivi est aussi mis à jour quand un client consulte sa commande.
  crons: [{ path: '/api/cron/sync', schedule: '0 7 * * *' }],
})

console.info(`[vercel] déploiement assemblé dans ${OUT}`)

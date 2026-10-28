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
    // Sécurité (R-008) : HTTPS imposé (HSTS, en plus de la redirection de Vercel), pas de devinette de type, pas
    // d'affichage dans le cadre d'un autre site, adresse d'origine réduite, caméra, micro et position refusés.
    {
      src: '^/(.*)$',
      headers: {
        'Strict-Transport-Security': 'max-age=63072000',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
      continue: true,
    },
    // Pages privées (commande, suivi, paiement) : jamais indexées, même sans exécuter le JavaScript.
    {
      src: '^/(commande|suivi|paiement-demo)(/.*)?$',
      headers: { 'X-Robots-Tag': 'noindex, nofollow' },
      continue: true,
    },
    // Fichiers à nom unique (assets/…-hash.js) : mis en cache longtemps.
    {
      src: '^/assets/(.*)$',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      continue: true,
    },
    { src: '^/api(?:/.*)?$', dest: '/api' },
    // Vidéos et images de l'accueil, polices : en cache une journée.
    {
      src: '^/(media|fonts)/(.*)$',
      headers: { 'Cache-Control': 'public, max-age=86400' },
      continue: true,
    },
    // « / » sert index.html, l'accueil copié de frontend2/.
    { handle: 'filesystem' },
    { src: '^/(assets|media|fonts)/.*$', status: 404 },
    // Application React : toutes les autres adresses renvoient app.html.
    { src: '^/.*$', dest: '/app.html' },
  ],
  // Suivi des colis une fois par jour (maximum de l'offre gratuite de Vercel) ;
  // le suivi est aussi mis à jour quand un client consulte sa commande.
  crons: [{ path: '/api/cron/sync', schedule: '0 7 * * *' }],
})

console.info(`[vercel] déploiement assemblé dans ${OUT}`)

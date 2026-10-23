import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { getDefaultApp } from './app'

// Serveur de production : l'API sous /api et le site construit (dist/) pour
// tout le reste. Lancé par `npm start` après `npm run build`.

// Secrets et réglages : variables d'environnement de l'hébergeur, ou fichier
// .env à la racine (voir .env.example).
try {
  process.loadEnvFile('.env')
} catch {
  // Pas de fichier .env.
}

const site = new Hono()
site.route('/', getDefaultApp('live'))
// Une adresse d'API inconnue répond 404 en JSON, pas avec la page du site.
site.all('/api/*', (c) => c.json({ message: 'Introuvable.' }, 404))

// Fichiers à nom unique (assets/…-hash.js) : mis en cache longtemps.
site.use('/assets/*', async (c, next) => {
  await next()
  c.header('Cache-Control', 'public, max-age=31536000, immutable')
})
// L'accueil (dist/index.html, copié de frontend2/) et tous les fichiers du site.
site.use('*', serveStatic({ root: './dist' }))
// Application React : toutes les autres adresses renvoient app.html.
site.get('*', serveStatic({ path: './dist/app.html' }))

const port = Number(process.env.PORT ?? 3000)
serve({ fetch: site.fetch, port }, (info) => {
  console.info(`[boutique] http://localhost:${info.port}`)
})

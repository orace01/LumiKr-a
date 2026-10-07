import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { getDefaultApp } from './app'

// Serveur de production : l'API sous /api et le site construit (dist/) pour
// tout le reste. Lancé par `npm start` après `npm run build`.

const site = new Hono()
site.route('/', getDefaultApp('live'))
// Une adresse d'API inconnue répond 404 en JSON, pas avec la page du site.
site.all('/api/*', (c) => c.json({ message: 'Introuvable.' }, 404))

// Fichiers à nom unique (assets/…-hash.js) : mis en cache longtemps.
site.use('/assets/*', async (c, next) => {
  await next()
  c.header('Cache-Control', 'public, max-age=31536000, immutable')
})
site.use('*', serveStatic({ root: './dist' }))
// Application d'une seule page : toutes les autres adresses renvoient index.html.
site.get('*', serveStatic({ path: './dist/index.html' }))

const port = Number(process.env.PORT ?? 3000)
serve({ fetch: site.fetch, port }, (info) => {
  console.info(`[boutique] http://localhost:${info.port}`)
})

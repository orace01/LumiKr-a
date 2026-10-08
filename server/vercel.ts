import { getRequestListener } from '@hono/node-server'
import { Hono } from 'hono'
import { getDefaultApp } from './app'

// Fonction Vercel : toute l'API /api/*, en mode réel par défaut (SHOP_MODE
// l'emporte). Assemblée avec le site par scripts/vercel-output.mjs ; les
// réglages viennent des variables d'environnement du projet Vercel.

const api = new Hono()
api.route('/', getDefaultApp('live'))
// Une adresse d'API inconnue répond 404 en JSON.
api.all('*', (c) => c.json({ message: 'Introuvable.' }, 404))

export default getRequestListener(api.fetch)

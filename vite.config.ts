import { getRequestListener } from '@hono/node-server'
import react from '@vitejs/plugin-react'
import { cpSync, createReadStream, existsSync, statSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vitest/config'
import { product } from './src/config/product.ts'
import { site } from './src/config/site.ts'

// Injecte le nom de marque et la description dans app.html, pour qu'ils ne
// soient définis qu'à un seul endroit (src/config).
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: (html) =>
      html.replaceAll('%BRAND%', site.brand).replaceAll('%DESCRIPTION%', product.shortDescription),
  }
}

// Sert l'API de la boutique (server/app.ts) sur /api pendant `npm run dev` :
// une seule commande lance le site et le serveur, en mode démo par défaut.
// Le module est rechargé à chaque modification de server/.
function shopApi(): Plugin {
  return {
    name: 'shop-api',
    configureServer(server) {
      // Mêmes variables que le serveur de production (clés CJ, SHOP_MODE…).
      try {
        process.loadEnvFile('.env')
      } catch {
        // Pas de fichier .env : mode démo.
      }
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        try {
          const { getDefaultApp } = await server.ssrLoadModule('/server/app.ts')
          await getRequestListener(getDefaultApp('demo').fetch)(req, res)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// L'accueil est la page statique de frontend2/ (vidéo, animations au défilement),
// servie telle quelle à « / » ; toutes les autres adresses sont l'application
// React (app.html : panier, commande, suivi, pages légales).
const HOME_DIR = path.resolve('frontend2')
// Outil de prévisualisation du prototype : pas sur le site.
const HOME_EXCLUDED = new Set(['serve.mjs'])
const HOME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

/** Un fichier de frontend2, avec les requêtes « Range » dont les vidéos ont besoin. */
function sendHomeFile(req: IncomingMessage, res: ServerResponse, file: string) {
  const size = statSync(file).size
  const type = HOME_TYPES[path.extname(file)] ?? 'application/octet-stream'
  const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range)
  if (range) {
    const start = range[1] ? Number(range[1]) : 0
    const end = range[2] ? Number(range[2]) : size - 1
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 })
    createReadStream(file, { start, end }).pipe(res)
    return
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' })
  createReadStream(file).pipe(res)
}

function homePage(): Plugin {
  let outDir = 'dist'
  let ssr = false
  return {
    name: 'home-page',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
      ssr = Boolean(config.build.ssr)
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const pathname = decodeURIComponent(url.pathname)
        const file = pathname === '/' ? path.join(HOME_DIR, 'index.html') : path.join(HOME_DIR, path.normalize(pathname))
        if (file.startsWith(HOME_DIR + path.sep) && !HOME_EXCLUDED.has(path.basename(file)) && existsSync(file) && statSync(file).isFile()) {
          sendHomeFile(req, res, file)
          return
        }
        // Une page du site (pas un fichier, pas l'API) : l'application React.
        const isPage = req.method === 'GET' && (req.headers.accept ?? '').includes('text/html') && !path.extname(pathname)
        if (isPage && !pathname.startsWith('/api/')) req.url = `/app.html${url.search}`
        next()
      })
    },
    // Build du site : frontend2 est copié tel quel à la racine de dist/.
    writeBundle() {
      if (ssr) return
      cpSync(HOME_DIR, outDir, { recursive: true, filter: (source) => !HOME_EXCLUDED.has(path.basename(source)) })
    },
  }
}

// Points d'entrée : le site (navigateur) et le serveur (build --ssr).
const CLIENT_INPUT: Record<string, string> = { app: 'app.html' }
const SERVER_INPUT: Record<string, string> = { main: 'server/main.ts', vercel: 'server/vercel.ts', cli: 'server/cli.ts' }

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), siteMeta(), shopApi(), homePage()],
  // Le serveur (build --ssr) n'a pas besoin d'une copie de public/ : il sert dist/.
  build: isSsrBuild
    ? {
        // Serveur de production, fonction Vercel et outil CJ, compilés dans dist-server/.
        outDir: 'dist-server',
        copyPublicDir: false,
        rollupOptions: { input: SERVER_INPUT },
      }
    : { rollupOptions: { input: CLIENT_INPUT } },
  // Dépendances (hono…) incluses dans dist-server/ : la fonction Vercel n'a pas de node_modules.
  ssr: isSsrBuild ? { noExternal: true } : {},
  test: {
    include: ['server/**/*.test.ts', 'src/**/*.test.ts'],
  },
}))

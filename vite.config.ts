import { getRequestListener } from '@hono/node-server'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vitest/config'
import { product } from './src/config/product.ts'
import { site } from './src/config/site.ts'

// Injecte le nom de marque et la description dans index.html, pour qu'ils ne
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

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), siteMeta(), shopApi()],
  // Le serveur (build --ssr) n'a pas besoin d'une copie de public/ : il sert dist/.
  build: isSsrBuild
    ? {
        // Serveur de production, fonction Vercel et outil CJ, compilés dans dist-server/.
        outDir: 'dist-server',
        copyPublicDir: false,
        rollupOptions: { input: { main: 'server/main.ts', vercel: 'server/vercel.ts', cli: 'server/cli.ts' } },
      }
    : {},
  // Dépendances (hono…) incluses dans dist-server/ : la fonction Vercel n'a pas de node_modules.
  ssr: isSsrBuild ? { noExternal: true } : {},
  test: {
    include: ['server/**/*.test.ts', 'src/**/*.test.ts'],
  },
}))

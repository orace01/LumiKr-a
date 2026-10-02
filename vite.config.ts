import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteMeta()],
})

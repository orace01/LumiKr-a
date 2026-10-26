import { useEffect, useRef, type ReactNode } from 'react'
import { CartBar } from './components/CartBar'
import { CartDrawer } from './components/CartDrawer'
import { DemoBanner } from './components/DemoBanner'
import { Footer } from './components/Footer'
import { CheckoutHeader, Header } from './components/Header'
import { site } from './config/site'
import { CheckoutPage } from './pages/CheckoutPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { DemoPaymentPage } from './pages/DemoPaymentPage'
import { Toast } from './components/Toast'
import { LegalPage, NotFoundPage } from './pages/LegalPage'
import { ProductPage } from './pages/ProductPage'
import { ShopPage } from './pages/ShopPage'
import { TrackingPage } from './pages/TrackingPage'
import { isShopPath, useLocation } from './router'
import { CartProvider } from './shop/CartProvider'
import { ShopProvider } from './shop/ShopProvider'

interface Route {
  page: ReactNode
  /** `checkout` : en-tête réduit, sans pied de page. `product` : en-tête posé sur la photo (téléphone). */
  chrome: 'page' | 'checkout' | 'product'
}

function resolve(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '') || '/'
  // L'accueil (/) n'est pas ici : c'est la page statique de frontend2/.
  switch (path) {
    case '/commande':
      return { page: <CheckoutPage />, chrome: 'checkout' }
    case '/commande/confirmation':
      return { page: <ConfirmationPage />, chrome: 'page' }
    case '/suivi':
      return { page: <TrackingPage />, chrome: 'page' }
    case '/paiement-demo':
      return { page: <DemoPaymentPage />, chrome: 'checkout' }
    case '/boutique':
      return { page: <ShopPage />, chrome: 'page' }
  }
  const productMatch = /^\/boutique\/([^/]+)$/.exec(path)
  if (productMatch) return { page: <ProductPage variantId={decodeURIComponent(productMatch[1])} />, chrome: 'product' }
  const legal = site.legalPages.find((candidate) => candidate.path === path)
  if (legal) return { page: <LegalPage page={legal} />, chrome: 'page' }
  return { page: <NotFoundPage />, chrome: 'page' }
}

function Shell() {
  const { pathname } = useLocation()
  const route = resolve(pathname)
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  // Changement de page : le focus revient au début du contenu, pour que les
  // lecteurs d'écran annoncent la nouvelle page.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (!window.location.hash) mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      {route.chrome === 'checkout' ? <CheckoutHeader /> : <Header backTo={route.chrome === 'product' ? '/boutique' : undefined} />}
      <main id="contenu" ref={mainRef} tabIndex={-1}>
        {route.page}
      </main>
      {route.chrome !== 'checkout' && <Footer />}
      {route.chrome !== 'checkout' && <CartBar always={isShopPath(pathname)} />}
      <CartDrawer />
      <Toast />
      <DemoBanner />
    </>
  )
}

export default function App() {
  return (
    <ShopProvider>
      <CartProvider>
        <Shell />
      </CartProvider>
    </ShopProvider>
  )
}

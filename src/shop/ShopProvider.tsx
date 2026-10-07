import { useEffect, useState, type ReactNode } from 'react'
import { api } from './api'
import { ShopContext, type ShopState } from './useShop'

/** Charge une fois le catalogue et les conditions de vente depuis le serveur. */
export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    api
      .shop()
      .then((info) => !cancelled && setState({ status: 'ready', info }))
      .catch(() => !cancelled && setState({ status: 'error' }))
    return () => {
      cancelled = true
    }
  }, [])

  return <ShopContext.Provider value={state}>{children}</ShopContext.Provider>
}

import { useEffect, useState } from 'react'
import { useShop } from '../shop/useShop'
import './ShippingOfferBar.css'

const PARIS = 'Europe/Paris'
const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', timeZone: PARIS })
const dayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: PARIS })

/** Temps restant à la minute près : « 6 j 23 h », « 5 h 07 min », « 12 min ». */
function timeLeft(ms: number) {
  const minutes = Math.max(0, Math.floor(ms / 60_000))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const rest = minutes % 60
  if (days > 0) return `${days} j ${hours} h`
  if (hours > 0) return `${hours} h ${String(rest).padStart(2, '0')} min`
  return `${rest} min`
}

/**
 * Bandeau du haut de l'en-tête : livraison offerte jusqu'à la date donnée par le serveur
 * (`freeShippingUntil`, src/config/shop.ts), avec le temps restant. Il disparaît à cette date.
 * L'accueil (frontend2/) en a une copie (frontend2/boutique.js).
 */
export function ShippingOfferBar() {
  const { info } = useShop()
  const until = info?.freeShippingUntil ?? null
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!until) return
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [until])

  if (!until) return null
  const end = new Date(until)
  const left = end.getTime() - now
  if (left <= 0) return null
  return (
    <p className="offer-bar">
      <strong>Livraison offerte</strong>
      <span>
        {' '}
        jusqu’au <span className="offer-bar__long">{weekday.format(end)} </span>
        {dayMonth.format(end)}
        <span className="offer-bar__long"> inclus</span>
      </span>
      <span className="offer-bar__left">
        {' · '}
        <span className="offer-bar__long">plus que </span>
        {timeLeft(left)}
      </span>
    </p>
  )
}

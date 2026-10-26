import { useEffect, useState } from 'react'
import { onToast, type ToastMessage } from '../shop/cartEffects'
import './Toast.css'

const DURATION_MS = 4000

/** Notification en bas de l'écran (« Ajouté au panier · Voir le panier »), qui glisse puis s'efface. */
export function Toast() {
  const [message, setMessage] = useState<(ToastMessage & { key: number }) | null>(null)

  useEffect(() => onToast((next) => setMessage({ ...next, key: Date.now() })), [])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [message])

  return (
    <div className="toast-zone" role="status" aria-live="polite">
      {message && (
        <div key={message.key} className="toast">
          <svg className="toast__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{message.text}</span>
          {message.action && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                message.action?.onClick()
                setMessage(null)
              }}
            >
              {message.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

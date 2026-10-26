import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from '../router'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  /** Changement de page animé (transition de vue), pour les pages de la boutique. */
  transition?: boolean
  replace?: boolean
}

/** Lien interne : change de page sans recharger le site. */
export function Link({ to, onClick, target, transition, replace, ...rest }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    if (event.defaultPrevented || event.button !== 0 || modified || target) return
    event.preventDefault()
    navigate(to, { transition, replace })
  }
  return <a href={to} target={target} onClick={handleClick} {...rest} />
}

import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from '../router'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
}

/** Lien interne : change de page sans recharger le site. */
export function Link({ to, onClick, target, ...rest }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    if (event.defaultPrevented || event.button !== 0 || modified || target) return
    event.preventDefault()
    navigate(to)
  }
  return <a href={to} target={target} onClick={handleClick} {...rest} />
}

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import './Field.css'

interface Common {
  name: string
  label: string
  error?: string
  hint?: ReactNode
  optional?: boolean
}

function describedBy(id: string, hint: unknown, error: unknown) {
  return [hint ? `${id}-aide` : '', error ? `${id}-erreur` : ''].filter(Boolean).join(' ') || undefined
}

function Messages({ id, hint, error }: { id: string; hint?: ReactNode; error?: string }) {
  return (
    <>
      {hint && (
        <p id={`${id}-aide`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-erreur`} className="field__error">
          {error}
        </p>
      )}
    </>
  )
}

/** Champ de saisie avec libellé, aide et message d'erreur reliés pour les lecteurs d'écran. */
export function Field({ name, label, error, hint, optional, className, ...input }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = `champ-${name}`
  return (
    <div className={`field${error ? ' field--error' : ''}${className ? ` ${className}` : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {optional && <span className="field__optional"> (facultatif)</span>}
      </label>
      <input
        id={id}
        name={name}
        className="field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...input}
      />
      <Messages id={id} hint={hint} error={error} />
    </div>
  )
}

export function SelectField({
  name,
  label,
  error,
  hint,
  className,
  children,
  ...select
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = `champ-${name}`
  return (
    <div className={`field${error ? ' field--error' : ''}${className ? ` ${className}` : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <select
        id={id}
        name={name}
        className="field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...select}
      >
        {children}
      </select>
      <Messages id={id} hint={hint} error={error} />
    </div>
  )
}

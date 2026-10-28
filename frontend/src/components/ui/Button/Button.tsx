import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../../lib/utils'
import './Button.styles.sass'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** Alturas 32/40 (§4.1). Todos los colores salen de tokens (T3). */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('button', `button--${variant}`, `button--${size}`, className)}
      {...props}
    />
  )
}

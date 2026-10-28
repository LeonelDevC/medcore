import type { HTMLAttributes } from 'react'
import { cx } from '../../../lib/utils'
import './Card.styles.sass'

/** Tarjeta con borde sutil (§4.1). Fondo siempre --surface. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('card', className)} {...props} />
}

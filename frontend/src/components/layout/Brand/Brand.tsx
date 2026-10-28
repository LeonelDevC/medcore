import { cx } from '../../../lib/utils'
import './Brand.styles.sass'

type BrandProps = {
  collapsed?: boolean
  className?: string
}

/** Marca del producto: marca blanca genérica (specs §10 D2). Sin logo externo. */
export function Brand({ collapsed = false, className }: BrandProps) {
  return (
    <span className={cx('brand', collapsed && 'brand--collapsed', className)}>
      <span aria-hidden="true" className="brand__mark">
        H
      </span>
      <span className="brand__name">Hospital</span>
    </span>
  )
}

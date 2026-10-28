import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import './EmptyState.styles.sass'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  children?: ReactNode
}

/** Estado vacío: icono + texto + acción opcional (§4.1). */
export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon size={20} aria-hidden="true" />
      </span>

      <div className="empty__text">
        <h2 className="empty__title">{title}</h2>
        <p className="empty__description">{description}</p>
      </div>

      {children ? <div className="empty__actions">{children}</div> : null}
    </div>
  )
}

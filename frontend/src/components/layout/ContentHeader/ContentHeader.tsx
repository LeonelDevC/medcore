import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import './ContentHeader.styles.sass'

type ContentHeaderProps = {
  title: string
  description?: string
  onOpenMenu: () => void
  /** Acciones contextuales a la derecha. El ThemeToggle va aquí siempre (§3). */
  children?: ReactNode
}

/** Header de contenido: título 24px + acciones. No es una navbar (§3, C3). */
export function ContentHeader({ title, description, onOpenMenu, children }: ContentHeaderProps) {
  return (
    <header className="content-header">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menú de navegación"
        className="content-header__menu"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <div className="content-header__titles">
        <h1 className="content-header__title">{title}</h1>
        {description ? <p className="content-header__description">{description}</p> : null}
      </div>

      <div className="content-header__actions">{children}</div>
    </header>
  )
}

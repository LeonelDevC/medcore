import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cx } from '../../../lib/utils'
import type { NavItem } from '../../../routes/nav'
import { Brand } from '../Brand/Brand'
import './Sidebar.styles.sass'

type SidebarNavProps = {
  items: NavItem[]
  collapsed: boolean
  onNavigate?: () => void
}

function SidebarNav({ items, collapsed, onNavigate }: SidebarNavProps) {
  return (
    <nav aria-label="Navegación principal" className="sidebar__nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) => cx('sidebar__link', isActive && 'sidebar__link--active')}
        >
          <item.icon size={20} aria-hidden="true" />
          <span className={cx('sidebar__label', collapsed && 'sr-only')}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

type SidebarProps = {
  items: NavItem[]
  collapsed: boolean
  onToggleCollapse: () => void
}

/**
 * Sidebar de escritorio: 240px expandido / 64px colapsado (§3).
 * Fondo --surface, borde --border, activo con --primary-soft y sin borde lateral.
 */
export function Sidebar({ items, collapsed, onToggleCollapse }: SidebarProps) {
  const toggleLabel = collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'

  return (
    <aside className={cx('sidebar', collapsed && 'sidebar--collapsed')}>
      <div className="sidebar__head">
        <Brand collapsed={collapsed} />
      </div>

      <SidebarNav items={items} collapsed={collapsed} />

      <div className="sidebar__foot">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-expanded={!collapsed}
          aria-label={toggleLabel}
          title={collapsed ? toggleLabel : undefined}
          className="sidebar__toggle"
        >
          {collapsed ? (
            <PanelLeftOpen size={20} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={20} aria-hidden="true" />
          )}
          <span className={cx('sidebar__toggle-label', collapsed && 'sr-only')}>
            {collapsed ? 'Expandir' : 'Colapsar'}
          </span>
        </button>
      </div>
    </aside>
  )
}

type SidebarDrawerProps = {
  open: boolean
  items: NavItem[]
  onClose: () => void
}

/** Drawer de móvil: único uso del icono hamburguesa en la app (§3). */
export function SidebarDrawer({ open, items, onClose }: SidebarDrawerProps) {
  if (!open) return null

  return (
    <div className="drawer">
      <button
        type="button"
        aria-label="Cerrar menú de navegación"
        onClick={onClose}
        className="drawer__backdrop"
      />
      <div role="dialog" aria-modal="true" aria-label="Menú de navegación" className="drawer__panel">
        <div className="drawer__head">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú de navegación"
            className="drawer__close"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <SidebarNav items={items} collapsed={false} onNavigate={onClose} />
      </div>
    </div>
  )
}

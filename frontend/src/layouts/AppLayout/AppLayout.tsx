import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ContentHeader } from '../../components/layout/ContentHeader/ContentHeader'
import { Sidebar, SidebarDrawer } from '../../components/layout/Sidebar/Sidebar'
import { ThemeToggle } from '../../components/theme/ThemeToggle/ThemeToggle'
import { useCurrentRole } from '../../hooks/useRole'
import { findNavItem, navItemsForRole } from '../../routes/nav'
import './AppLayout.styles.sass'

/**
 * Layout de las rutas autenticadas: sidebar (colapsable) + header de contenido.
 * Sin navbar horizontal (Â§3, C3).
 */
export function AppLayout() {
  const role = useCurrentRole()
  const items = navItemsForRole(role)
  const { pathname } = useLocation()
  const current = findNavItem(pathname)

  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // El drawer solo existe en mÃ³vil. Se cierra con Escape o al volver atrÃ¡s; al
  // navegar por el propio menÃº lo cierra `onNavigate` (no un efecto sobre la ruta).
  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    const onPopState = () => setDrawerOpen(false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('popstate', onPopState)
    }
  }, [drawerOpen])

  return (
    <div className="app">
      <Sidebar
        items={items}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />

      <SidebarDrawer open={drawerOpen} items={items} onClose={() => setDrawerOpen(false)} />

      <div className="app__body">
        <ContentHeader
          title={current?.label ?? 'PÃ¡gina no encontrada'}
          description={current?.description}
          onOpenMenu={() => setDrawerOpen(true)}
        >
          <ThemeToggle />
        </ContentHeader>

        <main className="app__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

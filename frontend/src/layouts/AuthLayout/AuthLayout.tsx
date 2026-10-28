import { Outlet } from 'react-router-dom'
import { Brand } from '../../components/layout/Brand/Brand'
import { ThemeToggle } from '../../components/theme/ThemeToggle/ThemeToggle'
import './AuthLayout.styles.sass'

/** Layout de las rutas pÃºblicas (login, recuperaciÃ³n). */
export function AuthLayout() {
  return (
    <div className="auth">
      <div className="auth__bar">
        <Brand />
        <ThemeToggle />
      </div>

      <main className="auth__main">
        <div className="auth__panel">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

import { LockKeyhole } from 'lucide-react'
import { Card } from '../../components/ui/Card/Card'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import { isApiConfigured } from '../../lib/api'
import './LoginPage.styles.sass'

/** M1 Autenticación — el formulario contra el API Go llega en T3.1 (Fase 3). */
export function LoginPage() {
  return (
    <div className="login-page">
      <Card>
        <EmptyState
          icon={LockKeyhole}
          title="Iniciar sesión"
          description="Acceso con email y contraseña, recuperación y logout (M1). La ruta y el tema están listos; el formulario se implementa en T3.1."
        >
          <p className="login-page__status">
            API:{' '}
            {isApiConfigured
              ? 'disponible'
              : 'pendiente (arranca el backend Go o define VITE_API_URL)'}
          </p>
        </EmptyState>
      </Card>
    </div>
  )
}

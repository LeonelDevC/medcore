import { Shield, Stethoscope } from 'lucide-react'
import { useCurrentRole } from '../../../hooks/useRole'
import { setRole } from '../../../lib/session'
import type { Role } from '../../../types'
import './RoleSwitcher.styles.sass'

/**
 * Selector interactivo de rol para desarrollo y auditoría del MVP.
 * Permite conmutar entre 'admin' y 'medico' para validar al instante
 * el árbol de navegación (sidebar) y los permisos inmutables en la UI.
 */
export function RoleSwitcher() {
  const currentRole = useCurrentRole() ?? 'admin'

  const handleSelectRole = (newRole: Role) => {
    if (newRole !== currentRole) {
      setRole(newRole)
    }
  }

  return (
    <div
      className="role-switcher"
      role="group"
      aria-label="Selector de rol de sesión"
    >
      <button
        type="button"
        className={`role-switcher__btn ${
          currentRole === 'admin' ? 'role-switcher__btn--active' : ''
        }`}
        onClick={() => handleSelectRole('admin')}
        aria-pressed={currentRole === 'admin'}
        title="Rol Administrador: Gestión de personal, pacientes, citas y consulta de informes."
      >
        <Shield size={14} aria-hidden="true" />
        <span>Admin</span>
      </button>

      <button
        type="button"
        className={`role-switcher__btn ${
          currentRole === 'medico' ? 'role-switcher__btn--active' : ''
        }`}
        onClick={() => handleSelectRole('medico')}
        aria-pressed={currentRole === 'medico'}
        title="Rol Médico: Acceso a Visor DICOM (Estudios), redacción de informes, firma y adendas."
      >
        <Stethoscope size={14} aria-hidden="true" />
        <span>Médico</span>
      </button>
    </div>
  )
}

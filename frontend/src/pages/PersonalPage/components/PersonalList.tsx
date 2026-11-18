import { useState } from 'react'
import { Plus, Edit2, Shield, Stethoscope, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '../../../components/ui/Button/Button'
import type { Personal } from '../../../types'

interface PersonalListProps {
  personal: Personal[]
  onNewPersonal: () => void
  onEditPersonal: (persona: Personal) => void
  onToggleActivo: (id: string, activo: boolean) => void
}

export function PersonalList({
  personal,
  onNewPersonal,
  onEditPersonal,
  onToggleActivo,
}: PersonalListProps) {
  const [filtro, setFiltro] = useState<'todos' | 'medicos' | 'admins' | 'activos'>('todos')

  const personalFiltrado = personal.filter((p) => {
    if (filtro === 'medicos') return p.rol === 'medico'
    if (filtro === 'admins') return p.rol === 'admin'
    if (filtro === 'activos') return p.activo
    return true
  })

  return (
    <div className="personal-list-container">
      <header className="personal-list-header">
        <div className="personal-chips-bar" role="toolbar" aria-label="Filtro de personal">
          <button
            type="button"
            className={`personal-chip ${filtro === 'todos' ? 'personal-chip--active' : ''}`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({personal.length})
          </button>
          <button
            type="button"
            className={`personal-chip ${filtro === 'medicos' ? 'personal-chip--active' : ''}`}
            onClick={() => setFiltro('medicos')}
          >
            Médicos ({personal.filter((p) => p.rol === 'medico').length})
          </button>
          <button
            type="button"
            className={`personal-chip ${filtro === 'admins' ? 'personal-chip--active' : ''}`}
            onClick={() => setFiltro('admins')}
          >
            Administradores ({personal.filter((p) => p.rol === 'admin').length})
          </button>
          <button
            type="button"
            className={`personal-chip ${filtro === 'activos' ? 'personal-chip--active' : ''}`}
            onClick={() => setFiltro('activos')}
          >
            Activos ({personal.filter((p) => p.activo).length})
          </button>
        </div>

        <Button variant="primary" onClick={onNewPersonal}>
          <Plus size={16} />
          Nuevo Personal
        </Button>
      </header>

      {personalFiltrado.length === 0 ? (
        <div className="personal-empty">
          <p>No se encontraron registros de personal para este filtro.</p>
        </div>
      ) : (
        <div className="personal-table-wrapper">
          <table className="personal-table" aria-label="Listado de personal médico y administrativo">
            <thead>
              <tr>
                <th scope="col">Nombre y Apellidos</th>
                <th scope="col">Contacto / Email</th>
                <th scope="col">Especialidad</th>
                <th scope="col">Rol</th>
                <th scope="col">Estado</th>
                <th scope="col" className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personalFiltrado.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.apellidos}</strong>, {p.nombre}
                  </td>
                  <td>{p.email}</td>
                  <td>
                    <span className="especialidad-badge">
                      <Stethoscope size={13} />
                      {p.especialidad}
                    </span>
                  </td>
                  <td>
                    <span className={`rol-badge rol-badge--${p.rol}`}>
                      {p.rol === 'admin' ? <Shield size={12} /> : null}
                      {p.rol.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`status-toggle ${p.activo ? 'status-toggle--active' : 'status-toggle--inactive'}`}
                      onClick={() => onToggleActivo(p.id, !p.activo)}
                      title={`Haga clic para ${p.activo ? 'desactivar' : 'activar'}`}
                    >
                      {p.activo ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Activo</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={13} />
                          <span>Inactivo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="personal-actions-cell">
                      <button
                        type="button"
                        className="btn-icon"
                        title="Editar personal"
                        onClick={() => onEditPersonal(p)}
                        aria-label={`Editar a ${p.nombre} ${p.apellidos}`}
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

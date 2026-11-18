import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../../components/ui/Button/Button'
import type { Personal, PersonalInput, Role } from '../../../types'

interface PersonalModalProps {
  isOpen: boolean
  persona?: Personal | null
  onClose: () => void
  onSave: (data: PersonalInput) => void
}

function PersonalModalForm({
  persona,
  onClose,
  onSave,
}: {
  persona?: Personal | null
  onClose: () => void
  onSave: (data: PersonalInput) => void
}) {
  const [nombre, setNombre] = useState(persona?.nombre ?? '')
  const [apellidos, setApellidos] = useState(persona?.apellidos ?? '')
  const [email, setEmail] = useState(persona?.email ?? '')
  const [especialidad, setEspecialidad] = useState(persona?.especialidad ?? 'Radiología')
  const [rol, setRol] = useState<Role>(persona?.rol ?? 'medico')
  const [activo, setActivo] = useState(persona?.activo ?? true)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !apellidos.trim() || !email.trim() || !especialidad.trim()) {
      setError('Por favor complete todos los campos obligatorios.')
      return
    }

    onSave({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim(),
      especialidad: especialidad.trim(),
      rol,
      activo,
    })
    onClose()
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-personal-title">
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="modal-personal-title">{persona ? 'Editar Personal' : 'Nuevo Miembro de Personal'}</h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error" role="alert">{error}</div>}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="per-nombre">Nombre *</label>
              <input
                id="per-nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Carmen"
              />
            </div>

            <div className="form-group">
              <label htmlFor="per-apellidos">Apellidos *</label>
              <input
                id="per-apellidos"
                type="text"
                required
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Navarro Soto"
              />
            </div>

            <div className="form-group">
              <label htmlFor="per-email">Correo Institucional *</label>
              <input
                id="per-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej. carmen.navarro@hospital.es"
              />
            </div>

            <div className="form-group">
              <label htmlFor="per-esp">Especialidad Clínica *</label>
              <input
                id="per-esp"
                type="text"
                required
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Ej. Radiodiagnóstico, Medicina Interna..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="per-rol">Rol en el Sistema *</label>
              <select
                id="per-rol"
                value={rol}
                onChange={(e) => setRol(e.target.value as Role)}
              >
                <option value="medico">Médico (acceso clínico y DICOM)</option>
                <option value="admin">Administrador (gestión global)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="per-activo">Estado del Usuario</label>
              <select
                id="per-activo"
                value={activo ? 'activo' : 'inactivo'}
                onChange={(e) => setActivo(e.target.value === 'activo')}
              >
                <option value="activo">Activo (cuenta habilitada)</option>
                <option value="inactivo">Inactivo (acceso suspendido)</option>
              </select>
            </div>
          </div>

          <footer className="modal-footer">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {persona ? 'Guardar Cambios' : 'Registrar Personal'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export function PersonalModal({
  isOpen,
  persona,
  onClose,
  onSave,
}: PersonalModalProps) {
  if (!isOpen) return null
  return (
    <PersonalModalForm
      key={persona?.id ?? 'nuevo-personal'}
      persona={persona}
      onClose={onClose}
      onSave={onSave}
    />
  )
}

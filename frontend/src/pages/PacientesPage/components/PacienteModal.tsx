import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../../components/ui/Button/Button'
import type { Paciente, PacienteInput } from '../../../types'

interface PacienteModalProps {
  isOpen: boolean
  paciente?: Paciente | null
  onClose: () => void
  onSave: (data: PacienteInput) => void
}

function PacienteModalForm({
  paciente,
  onClose,
  onSave,
}: {
  paciente?: Paciente | null
  onClose: () => void
  onSave: (data: PacienteInput) => void
}) {
  const [nombre, setNombre] = useState(paciente?.nombre ?? '')
  const [apellidos, setApellidos] = useState(paciente?.apellidos ?? '')
  const [documento, setDocumento] = useState(paciente?.documento ?? '')
  const [fechaNacimiento, setFechaNacimiento] = useState(paciente?.fechaNacimiento ?? '')
  const [telefono, setTelefono] = useState(paciente?.telefono ?? '')
  const [email, setEmail] = useState(paciente?.email ?? '')
  const [notas, setNotas] = useState(paciente?.notas ?? '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !apellidos.trim() || !documento.trim() || !fechaNacimiento.trim()) {
      setError('Por favor complete los campos obligatorios: Nombre, Apellidos, Documento y F. Nacimiento.')
      return
    }

    onSave({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      documento: documento.trim(),
      fechaNacimiento: fechaNacimiento.trim(),
      telefono: telefono.trim() || undefined,
      email: email.trim() || undefined,
      notas: notas.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="modal-title">{paciente ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>
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
              <label htmlFor="p-nombre">Nombre *</label>
              <input
                id="p-nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Laura"
              />
            </div>

            <div className="form-group">
              <label htmlFor="p-apellidos">Apellidos *</label>
              <input
                id="p-apellidos"
                type="text"
                required
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Gómez Sanz"
              />
            </div>

            <div className="form-group">
              <label htmlFor="p-doc">Documento (DNI/NIE) *</label>
              <input
                id="p-doc"
                type="text"
                required
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ej. 12345678Z"
              />
            </div>

            <div className="form-group">
              <label htmlFor="p-nac">Fecha Nacimiento (AAAA-MM-DD) *</label>
              <input
                id="p-nac"
                type="date"
                required
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="p-tel">Teléfono</label>
              <input
                id="p-tel"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. +34 600 000 000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="p-mail">Correo Electrónico</label>
              <input
                id="p-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej. laura@ejemplo.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="p-notas">Notas Clínicas Iniciales</label>
            <textarea
              id="p-notas"
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Alergias conocidas, antecedentes relevantes o condiciones crónicas..."
            />
          </div>

          <footer className="modal-footer">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {paciente ? 'Guardar Cambios' : 'Registrar Paciente'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export function PacienteModal({ isOpen, paciente, onClose, onSave }: PacienteModalProps) {
  if (!isOpen) return null
  return (
    <PacienteModalForm
      key={paciente?.id ?? 'nuevo'}
      paciente={paciente}
      onClose={onClose}
      onSave={onSave}
    />
  )
}

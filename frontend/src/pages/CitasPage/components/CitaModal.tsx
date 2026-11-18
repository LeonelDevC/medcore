import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../../components/ui/Button/Button'
import type { CitaInput, Paciente, Personal } from '../../../types'

interface CitaModalProps {
  isOpen: boolean
  pacientes: Paciente[]
  personal: Personal[]
  currentUserId?: string
  onClose: () => void
  onSave: (data: CitaInput) => void
}

function CitaModalForm({
  pacientes,
  personal,
  onClose,
  onSave,
}: {
  pacientes: Paciente[]
  personal: Personal[]
  onClose: () => void
  onSave: (data: CitaInput) => void
}) {
  const [pacienteId, setPacienteId] = useState(pacientes[0]?.id ?? '')
  const [medicoId, setMedicoId] = useState(
    personal.find((p) => p.rol === 'medico')?.id ?? 'med_01'
  )
  const [fecha, setFecha] = useState('2026-11-20T10:00')
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pacienteId || !medicoId || !fecha || !motivo.trim()) {
      setError('Por favor complete todos los campos requeridos.')
      return
    }

    onSave({
      pacienteId,
      medicoId,
      fecha: new Date(fecha).toISOString(),
      motivo: motivo.trim(),
      estado: 'programada',
    })
    onClose()
  }

  const medicos = personal.filter((p) => p.rol === 'medico')

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-cita-title">
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="modal-cita-title">Programar Nueva Cita</h2>
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

          <div className="form-group">
            <label htmlFor="cita-paciente">Paciente *</label>
            <select
              id="cita-paciente"
              value={pacienteId}
              required
              onChange={(e) => setPacienteId(e.target.value)}
            >
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellidos}, {p.nombre} ({p.documento})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cita-medico">Facultativo / Médico Asignado *</label>
            <select
              id="cita-medico"
              value={medicoId}
              required
              onChange={(e) => setMedicoId(e.target.value)}
            >
              {medicos.length > 0 ? (
                medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    Dr(a). {m.apellidos}, {m.nombre} — {m.especialidad}
                  </option>
                ))
              ) : (
                <option value="med_01">Dr. Alejandro Morales — Radiología</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cita-fecha">Fecha y Hora *</label>
            <input
              id="cita-fecha"
              type="datetime-local"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cita-motivo">Motivo de Consulta *</label>
            <textarea
              id="cita-motivo"
              rows={3}
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Revisión de radiografía de tórax y control post-operatorio..."
            />
          </div>

          <footer className="modal-footer">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Confirmar Cita
            </Button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export function CitaModal({
  isOpen,
  pacientes,
  personal,
  onClose,
  onSave,
}: CitaModalProps) {
  if (!isOpen) return null
  return (
    <CitaModalForm
      key="nueva-cita"
      pacientes={pacientes}
      personal={personal}
      onClose={onClose}
      onSave={onSave}
    />
  )
}

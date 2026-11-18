import { useState } from 'react'
import { Plus, CheckCircle, XCircle, Calendar, Clock } from 'lucide-react'
import { Button } from '../../../components/ui/Button/Button'
import type { Cita, EstadoCita, Paciente } from '../../../types'

interface CitasAgendaProps {
  citas: Cita[]
  pacientes: Paciente[]
  onNewCita: () => void
  onUpdateEstado: (id: string, nuevoEstado: EstadoCita) => void
}

export function CitasAgenda({
  citas,
  pacientes,
  onNewCita,
  onUpdateEstado,
}: CitasAgendaProps) {
  const [filtroEstado, setFiltroEstado] = useState<'todas' | EstadoCita>('todas')

  const citasFiltradas = citas.filter((c) => {
    if (filtroEstado === 'todas') return true
    return c.estado === filtroEstado
  })

  // Obtener nombre del paciente por ID
  const getNombrePaciente = (pacienteId: string) => {
    const pac = pacientes.find((p) => p.id === pacienteId)
    return pac ? `${pac.apellidos}, ${pac.nombre}` : `Paciente ${pacienteId}`
  }

  return (
    <div className="citas-agenda-container">
      <header className="citas-agenda-header">
        <div className="citas-chips-bar" role="toolbar" aria-label="Filtro de estados">
          <button
            type="button"
            className={`citas-chip ${filtroEstado === 'todas' ? 'citas-chip--active' : ''}`}
            onClick={() => setFiltroEstado('todas')}
          >
            Todas ({citas.length})
          </button>
          <button
            type="button"
            className={`citas-chip ${filtroEstado === 'programada' ? 'citas-chip--active' : ''}`}
            onClick={() => setFiltroEstado('programada')}
          >
            Programadas ({citas.filter((c) => c.estado === 'programada').length})
          </button>
          <button
            type="button"
            className={`citas-chip ${filtroEstado === 'realizada' ? 'citas-chip--active' : ''}`}
            onClick={() => setFiltroEstado('realizada')}
          >
            Realizadas ({citas.filter((c) => c.estado === 'realizada').length})
          </button>
          <button
            type="button"
            className={`citas-chip ${filtroEstado === 'cancelada' ? 'citas-chip--active' : ''}`}
            onClick={() => setFiltroEstado('cancelada')}
          >
            Canceladas ({citas.filter((c) => c.estado === 'cancelada').length})
          </button>
        </div>

        <Button variant="primary" onClick={onNewCita}>
          <Plus size={16} />
          Programar Cita
        </Button>
      </header>

      {citasFiltradas.length === 0 ? (
        <div className="citas-empty">
          <p>No hay citas registradas para este filtro.</p>
        </div>
      ) : (
        <div className="citas-list">
          {citasFiltradas.map((cita) => {
            const fechaHora = new Date(cita.fecha)
            const esTerminal = cita.estado === 'realizada' || cita.estado === 'cancelada'

            return (
              <article key={cita.id} className="cita-card">
                <div className="cita-card-main">
                  <div className="cita-time-block">
                    <Calendar size={18} className="cita-icon" />
                    <div>
                      <strong>{isNaN(fechaHora.getTime()) ? cita.fecha : fechaHora.toLocaleDateString()}</strong>
                      <span className="cita-time">
                        <Clock size={12} />
                        {isNaN(fechaHora.getTime()) ? '' : fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="cita-info-block">
                    <h3 className="cita-patient-name">{getNombrePaciente(cita.pacienteId)}</h3>
                    <p className="cita-reason">{cita.motivo}</p>
                  </div>
                </div>

                <div className="cita-card-actions">
                  <span className={`estado-tag estado-tag--${cita.estado}`}>
                    {cita.estado.toUpperCase()}
                  </span>

                  {!esTerminal && (
                    <div className="cita-buttons-group">
                      <button
                        type="button"
                        className="btn-action btn-action--success"
                        onClick={() => onUpdateEstado(cita.id, 'realizada')}
                        title="Marcar cita como realizada"
                        aria-label={`Completar cita de ${getNombrePaciente(cita.pacienteId)}`}
                      >
                        <CheckCircle size={15} />
                        <span>Realizada</span>
                      </button>
                      <button
                        type="button"
                        className="btn-action btn-action--danger"
                        onClick={() => onUpdateEstado(cita.id, 'cancelada')}
                        title="Cancelar cita"
                        aria-label={`Cancelar cita de ${getNombrePaciente(cita.pacienteId)}`}
                      >
                        <XCircle size={15} />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  )}

                  {esTerminal && (
                    <span className="cita-locked-notice" title="Los estados finales no se pueden modificar">
                      Estado final
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

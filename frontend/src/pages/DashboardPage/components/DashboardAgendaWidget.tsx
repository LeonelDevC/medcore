import { Calendar, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Cita, Paciente } from '../../../types'

interface DashboardAgendaWidgetProps {
  citas: Cita[]
  pacientes: Paciente[]
}

export function DashboardAgendaWidget({ citas, pacientes }: DashboardAgendaWidgetProps) {
  const getNombrePaciente = (pacienteId: string) => {
    const p = pacientes.find((pac) => pac.id === pacienteId)
    return p ? `${p.apellidos}, ${p.nombre}` : `Paciente ${pacienteId}`
  }

  const citasHoy = citas.slice(0, 4)

  return (
    <div className="dashboard-widget-card">
      <div className="widget-header">
        <div className="widget-title-row">
          <Calendar size={18} className="widget-icon" />
          <h3>Agenda Próxima</h3>
        </div>
        <Link to="/citas" className="widget-link">
          Ver todas las citas →
        </Link>
      </div>

      {citasHoy.length === 0 ? (
        <p className="widget-empty">No hay citas programadas para hoy.</p>
      ) : (
        <ul className="agenda-widget-list">
          {citasHoy.map((cita) => {
            const fechaHora = new Date(cita.fecha)
            return (
              <li key={cita.id} className="agenda-widget-item">
                <div className="agenda-widget-time">
                  <Clock size={13} />
                  <span>
                    {isNaN(fechaHora.getTime())
                      ? cita.fecha.split('T')[1]?.slice(0, 5) || '10:00'
                      : fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="agenda-widget-desc">
                  <strong>{getNombrePaciente(cita.pacienteId)}</strong>
                  <span className="agenda-widget-motivo">{cita.motivo}</span>
                </div>
                <span className={`estado-tag estado-tag--${cita.estado}`}>
                  {cita.estado.toUpperCase()}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

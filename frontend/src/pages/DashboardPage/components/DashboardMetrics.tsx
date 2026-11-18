import { Users, Calendar, ScanLine, FileText, BriefcaseMedical } from 'lucide-react'
import type { Role } from '../../../types'

interface DashboardMetricsProps {
  role: Role | null
  totalPacientes: number
  totalCitasHoy: number
  totalEstudios: number
  totalInformes: number
  totalPersonal: number
}

export function DashboardMetrics({
  role,
  totalPacientes,
  totalCitasHoy,
  totalEstudios,
  totalInformes,
  totalPersonal,
}: DashboardMetricsProps) {
  return (
    <div className="dashboard-metrics-grid" role="region" aria-label="Indicadores del día">
      <div className="metric-card">
        <div className="metric-icon metric-icon--primary" aria-hidden="true">
          <Users size={20} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Pacientes Registrados</span>
          <strong className="metric-value">{totalPacientes}</strong>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon metric-icon--info" aria-hidden="true">
          <Calendar size={20} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Citas Programadas</span>
          <strong className="metric-value">{totalCitasHoy}</strong>
        </div>
      </div>

      {role === 'admin' ? (
        <div className="metric-card">
          <div className="metric-icon metric-icon--warning" aria-hidden="true">
            <BriefcaseMedical size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Personal Activo</span>
            <strong className="metric-value">{totalPersonal}</strong>
          </div>
        </div>
      ) : (
        <div className="metric-card">
          <div className="metric-icon metric-icon--primary" aria-hidden="true">
            <ScanLine size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Estudios Radiológicos</span>
            <strong className="metric-value">{totalEstudios}</strong>
          </div>
        </div>
      )}

      <div className="metric-card">
        <div className="metric-icon metric-icon--success" aria-hidden="true">
          <FileText size={20} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Informes Clínicos</span>
          <strong className="metric-value">{totalInformes}</strong>
        </div>
      </div>
    </div>
  )
}

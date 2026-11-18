import { UserPlus, CalendarPlus, ScanLine, FileText, BriefcaseMedical, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Role } from '../../../types'

interface DashboardQuickActionsProps {
  role: Role | null
}

export function DashboardQuickActions({ role }: DashboardQuickActionsProps) {
  return (
    <div className="dashboard-widget-card">
      <div className="widget-header">
        <h3>Accesos Rápidos Clínicos</h3>
      </div>

      <div className="quick-actions-grid">
        {role === 'admin' ? (
          <>
            <Link to="/pacientes" className="quick-action-btn">
              <div className="quick-action-icon quick-action-icon--primary">
                <UserPlus size={18} />
              </div>
              <div className="quick-action-text">
                <strong>Nuevo Paciente</strong>
                <span>Registrar alta en M3</span>
              </div>
              <ArrowRight size={16} className="quick-action-arrow" />
            </Link>

            <Link to="/citas" className="quick-action-btn">
              <div className="quick-action-icon quick-action-icon--info">
                <CalendarPlus size={18} />
              </div>
              <div className="quick-action-text">
                <strong>Programar Cita</strong>
                <span>Agendar consulta en M4</span>
              </div>
              <ArrowRight size={16} className="quick-action-arrow" />
            </Link>

            <Link to="/personal" className="quick-action-btn">
              <div className="quick-action-icon quick-action-icon--warning">
                <BriefcaseMedical size={18} />
              </div>
              <div className="quick-action-text">
                <strong>Personal Médico</strong>
                <span>Gestionar facultativos en M5</span>
              </div>
              <ArrowRight size={16} className="quick-action-arrow" />
            </Link>

            <Link to="/informes" className="quick-action-btn">
              <div className="quick-action-icon quick-action-icon--success">
                <FileText size={18} />
              </div>
              <div className="quick-action-text">
                <strong>Ver Informes</strong>
                <span>Consultar historial de informes M7</span>
              </div>
              <ArrowRight size={16} className="quick-action-arrow" />
            </Link>
          </>
        ) : (
          <>
            <Link to="/estudios" className="quick-action-btn">
              <div className="quick-action-icon quick-action-icon--primary">
                <ScanLine size={18} />
              </div>
              <div className="quick-action-text">
                <strong>Visor DICOM</strong>
                <span>Cargar y medir estudios M6</span>
              </div>
              <ArrowRight size={16} className="quick-action-arrow" />
            </Link>

            <Link to="/informes" className="quick-action-btn">
              <div className="quick-action-icon quick-action-icon--success">
                <FileText size={18} />
              </div>
              <div className="quick-action-text">
                <strong>Redactar Informe</strong>
                <span>Emitir y firmar diagnóstico M7</span>
              </div>
              <ArrowRight size={16} className="quick-action-arrow" />
            </Link>

            <Link to="/citas" className="quick-action-btn">
              <div className="quick-action-icon quick-action-icon--info">
                <CalendarPlus size={18} />
              </div>
              <div className="quick-action-text">
                <strong>Mi Agenda</strong>
                <span>Citas del día y estado M4</span>
              </div>
              <ArrowRight size={16} className="quick-action-arrow" />
            </Link>

            <Link to="/pacientes" className="quick-action-btn">
              <div className="quick-action-icon quick-action-icon--primary">
                <UserPlus size={18} />
              </div>
              <div className="quick-action-text">
                <strong>Fichas de Pacientes</strong>
                <span>Consultar historial clínico M3</span>
              </div>
              <ArrowRight size={16} className="quick-action-arrow" />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

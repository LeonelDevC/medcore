import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Edit2, Calendar, FileText, ScanLine, Plus } from 'lucide-react'
import { Button } from '../../../components/ui/Button/Button'
import type { Paciente, Cita, Estudio, Informe } from '../../../types'

interface PacienteFichaProps {
  paciente: Paciente
  citas: Cita[]
  estudios: Estudio[]
  informes: Informe[]
  userRole: string | null
  onBack: () => void
  onEdit: () => void
  onNewCita: () => void
}

function calcularEdad(fechaNac: string): string {
  if (!fechaNac) return '—'
  const partes = fechaNac.split('-')
  if (partes.length < 1) return '—'
  const anoNac = parseInt(partes[0], 10)
  if (isNaN(anoNac)) return '—'
  return `${2026 - anoNac} años`
}

export function PacienteFicha({
  paciente,
  citas,
  estudios,
  informes,
  userRole,
  onBack,
  onEdit,
  onNewCita,
}: PacienteFichaProps) {
  const [tabActiva, setTabActiva] = useState<'citas' | 'estudios' | 'informes'>('citas')

  const citasPaciente = citas.filter((c) => c.pacienteId === paciente.id)
  const estudiosPaciente = estudios.filter((e) => e.pacienteId === paciente.id)
  const informesPaciente = informes.filter((i) => i.pacienteId === paciente.id)

  return (
    <div className="paciente-ficha">
      <div className="paciente-ficha-topbar">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          Volver al listado
        </Button>
        <Button variant="secondary" onClick={onEdit}>
          <Edit2 size={16} />
          Editar Paciente
        </Button>
      </div>

      <div className="paciente-ficha-card">
        <header className="paciente-ficha-header">
          <div className="paciente-ficha-avatar" aria-hidden="true">
            {paciente.nombre[0]}
            {paciente.apellidos[0]}
          </div>
          <div className="paciente-ficha-title">
            <h2>{paciente.apellidos}, {paciente.nombre}</h2>
            <div className="paciente-ficha-sub">
              <span><strong>Doc:</strong> {paciente.documento}</span>
              <span><strong>F. Nacimiento:</strong> {paciente.fechaNacimiento} ({calcularEdad(paciente.fechaNacimiento)})</span>
            </div>
          </div>
        </header>

        <div className="paciente-ficha-details">
          <div className="detail-item">
            <span className="detail-label">Teléfono:</span>
            <span className="detail-val">{paciente.telefono || 'No registrado'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-val">{paciente.email || 'No registrado'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fecha de alta:</span>
            <span className="detail-val">{paciente.creadoEn.split('T')[0]}</span>
          </div>
        </div>

        {paciente.notas && (
          <div className="paciente-ficha-notes">
            <h4>Notas Clínicas</h4>
            <p>{paciente.notas}</p>
          </div>
        )}
      </div>

      <div className="paciente-tabs-section">
        <div className="paciente-tabs-bar" role="tablist" aria-label="Historial del paciente">
          <button
            type="button"
            role="tab"
            aria-selected={tabActiva === 'citas'}
            className={`tab-btn ${tabActiva === 'citas' ? 'tab-btn--active' : ''}`}
            onClick={() => setTabActiva('citas')}
          >
            <Calendar size={16} />
            Citas ({citasPaciente.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tabActiva === 'estudios'}
            className={`tab-btn ${tabActiva === 'estudios' ? 'tab-btn--active' : ''}`}
            onClick={() => setTabActiva('estudios')}
          >
            <ScanLine size={16} />
            Estudios DICOM ({estudiosPaciente.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tabActiva === 'informes'}
            className={`tab-btn ${tabActiva === 'informes' ? 'tab-btn--active' : ''}`}
            onClick={() => setTabActiva('informes')}
          >
            <FileText size={16} />
            Informes ({informesPaciente.length})
          </button>
        </div>

        <div className="tab-content" role="tabpanel">
          {tabActiva === 'citas' && (
            <div className="tab-citas">
              <div className="tab-header-actions">
                <h3>Agenda de Citas</h3>
                <Button variant="primary" onClick={onNewCita}>
                  <Plus size={16} />
                  Programar Cita
                </Button>
              </div>
              {citasPaciente.length === 0 ? (
                <p className="tab-empty">Este paciente no tiene citas registradas.</p>
              ) : (
                <ul className="tab-list">
                  {citasPaciente.map((c) => (
                    <li key={c.id} className="tab-list-item">
                      <div className="tab-list-info">
                        <strong>{c.fecha.replace('T', ' ')}</strong>
                        <p>{c.motivo}</p>
                      </div>
                      <span className={`estado-tag estado-tag--${c.estado}`}>
                        {c.estado.toUpperCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tabActiva === 'estudios' && (
            <div className="tab-estudios">
              <div className="tab-header-actions">
                <h3>Estudios Radiológicos (M6)</h3>
                {userRole === 'medico' && (
                  <Link to="/estudios" className="btn-link">
                    Ir al Visor DICOM
                  </Link>
                )}
              </div>
              {estudiosPaciente.length === 0 ? (
                <p className="tab-empty">No hay estudios DICOM cargados para este paciente.</p>
              ) : (
                <ul className="tab-list">
                  {estudiosPaciente.map((e) => (
                    <li key={e.id} className="tab-list-item">
                      <div className="tab-list-info">
                        <strong>Modalidad: {e.modalidad}</strong>
                        <p>{e.descripcion || 'Sin descripción'}</p>
                        <span className="text-muted">
                          {e.numeroCortes} cortes · {e.fechaEstudio} · {e.mediciones.length} mediciones
                        </span>
                      </div>
                      {userRole === 'medico' && (
                        <Link to="/estudios" className="btn-link-action">
                          Abrir estudio
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tabActiva === 'informes' && (
            <div className="tab-informes">
              <div className="tab-header-actions">
                <h3>Informes Clínicos (M7)</h3>
                <Link to="/informes" className="btn-link">
                  Ver módulo de informes
                </Link>
              </div>
              {informesPaciente.length === 0 ? (
                <p className="tab-empty">No hay informes emitidos para este paciente.</p>
              ) : (
                <ul className="tab-list">
                  {informesPaciente.map((inf) => (
                    <li key={inf.id} className="tab-list-item">
                      <div className="tab-list-info">
                        <strong>{inf.motivo}</strong>
                        <p className="text-muted">Conclusión: {inf.conclusion.slice(0, 80)}...</p>
                        <span className="text-muted">Fecha: {inf.creadoEn.split('T')[0]}</span>
                      </div>
                      <span className={`estado-tag estado-tag--${inf.estado}`}>
                        {inf.estado.toUpperCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

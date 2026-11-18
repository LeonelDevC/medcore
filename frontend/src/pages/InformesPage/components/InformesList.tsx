import { FileText, ArrowRight } from 'lucide-react'
import { Card } from '../../../components/ui/Card/Card'
import { Button } from '../../../components/ui/Button/Button'
import { EmptyState } from '../../../components/ui/EmptyState/EmptyState'
import type { Informe, Paciente } from '../../../types'

export type EstadoFiltro = 'todos' | 'borrador' | 'firmado'

type InformesListProps = {
  informes: Informe[]
  pacientes: Paciente[]
  filtroEstado: EstadoFiltro
  setFiltroEstado: (estado: EstadoFiltro) => void
  filtroPaciente: string
  setFiltroPaciente: (id: string) => void
  onSelectInforme: (id: string) => void
  getPacienteNombre: (pacienteId: string) => string
}

/**
 * Subcomponente de lista de informes con chips contextuales (Constitución C4)
 * y badges explícitos >= 12px (Constitución C5).
 */
export function InformesList({
  informes,
  pacientes,
  filtroEstado,
  setFiltroEstado,
  filtroPaciente,
  setFiltroPaciente,
  onSelectInforme,
  getPacienteNombre,
}: InformesListProps) {
  const informesFiltrados = informes.filter((inf) => {
    if (filtroEstado !== 'todos' && inf.estado !== filtroEstado) return false
    if (filtroPaciente !== 'todos' && inf.pacienteId !== filtroPaciente) return false
    return true
  })

  return (
    <div className="informes-page__list-view">
      {/* Barra de Filtros Contextuales (C4: Sin buscador global) */}
      <div className="informes-page__filters-bar" role="toolbar" aria-label="Filtros de informes">
        <div className="informes-page__chips-group">
          <button
            type="button"
            className={`informes-page__chip ${
              filtroEstado === 'todos' ? 'informes-page__chip--active' : ''
            }`}
            onClick={() => setFiltroEstado('todos')}
          >
            Todos ({informes.length})
          </button>

          <button
            type="button"
            className={`informes-page__chip ${
              filtroEstado === 'borrador' ? 'informes-page__chip--active' : ''
            }`}
            onClick={() => setFiltroEstado('borrador')}
          >
            Borradores ({informes.filter((i) => i.estado === 'borrador').length})
          </button>

          <button
            type="button"
            className={`informes-page__chip ${
              filtroEstado === 'firmado' ? 'informes-page__chip--active' : ''
            }`}
            onClick={() => setFiltroEstado('firmado')}
          >
            Firmados ({informes.filter((i) => i.estado === 'firmado').length})
          </button>
        </div>

        <div className="informes-page__patient-filter">
          <label htmlFor="filter-paciente" className="informes-page__patient-label">
            Paciente:
          </label>
          <select
            id="filter-paciente"
            value={filtroPaciente}
            onChange={(e) => setFiltroPaciente(e.target.value)}
            className="informes-page__select informes-page__select--sm"
          >
            <option value="todos">Todos los pacientes</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.apellidos}, {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de informes */}
      {informesFiltrados.length > 0 ? (
        <Card className="informes-page__table-card">
          <table className="informes-page__table" aria-label="Lista de informes médicos">
            <thead>
              <tr>
                <th scope="col">Estado</th>
                <th scope="col">ID</th>
                <th scope="col">Paciente</th>
                <th scope="col">Motivo</th>
                <th scope="col">Médico</th>
                <th scope="col">Fecha</th>
                <th scope="col" className="informes-page__col-action">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {informesFiltrados.map((inf) => (
                <tr key={inf.id} className="informes-page__table-row">
                  <td>
                    <span className={`informes-page__badge informes-page__badge--${inf.estado}`}>
                      {inf.estado === 'firmado' ? 'Firmado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="informes-page__cell-id">{inf.id}</td>
                  <td className="informes-page__cell-patient">
                    <strong>{getPacienteNombre(inf.pacienteId)}</strong>
                  </td>
                  <td className="informes-page__cell-motivo">{inf.motivo}</td>
                  <td>{inf.medicoId}</td>
                  <td className="informes-page__cell-date">
                    {new Date(inf.creadoEn).toLocaleDateString('es-ES')}
                  </td>
                  <td className="informes-page__col-action">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectInforme(inf.id)}
                      className="informes-page__row-btn"
                      aria-label={`Ver informe ${inf.id}`}
                    >
                      <span>Ver</span>
                      <ArrowRight size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={FileText}
            title="No se encontraron informes"
            description={
              filtroEstado !== 'todos' || filtroPaciente !== 'todos'
                ? 'No hay informes que coincidan con los filtros seleccionados.'
                : 'Aún no se han redactado informes médicos en el sistema.'
            }
          />
        </Card>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../components/ui/Button/Button'
import type { Paciente } from '../../../types'

interface PacientesListProps {
  pacientes: Paciente[]
  onSelectPaciente: (paciente: Paciente) => void
  onNewPaciente: () => void
  onEditPaciente: (paciente: Paciente) => void
  onDeletePaciente: (id: string) => void
}

export function PacientesList({
  pacientes,
  onSelectPaciente,
  onNewPaciente,
  onEditPaciente,
  onDeletePaciente,
}: PacientesListProps) {
  const [filtro, setFiltro] = useState<'todos' | 'conTelefono' | 'recientes'>('todos')
  const [pagina, setPagina] = useState(1)
  const itemsPorPagina = 8

  const pacientesFiltrados = pacientes.filter((p) => {
    if (filtro === 'conTelefono') return Boolean(p.telefono && p.telefono.trim().length > 0)
    if (filtro === 'recientes') {
      return p.creadoEn >= '2026-01-01'
    }
    return true
  })

  const totalPaginas = Math.max(1, Math.ceil(pacientesFiltrados.length / itemsPorPagina))
  const inicio = (pagina - 1) * itemsPorPagina
  const pacientesPaginados = pacientesFiltrados.slice(inicio, inicio + itemsPorPagina)

  return (
    <div className="pacientes-list-container">
      <header className="pacientes-list-header">
        <div className="pacientes-chips-bar" role="toolbar" aria-label="Filtros contextuales">
          <button
            type="button"
            className={`pacientes-chip ${filtro === 'todos' ? 'pacientes-chip--active' : ''}`}
            onClick={() => { setFiltro('todos'); setPagina(1) }}
          >
            Todos ({pacientes.length})
          </button>
          <button
            type="button"
            className={`pacientes-chip ${filtro === 'conTelefono' ? 'pacientes-chip--active' : ''}`}
            onClick={() => { setFiltro('conTelefono'); setPagina(1) }}
          >
            Con teléfono
          </button>
          <button
            type="button"
            className={`pacientes-chip ${filtro === 'recientes' ? 'pacientes-chip--active' : ''}`}
            onClick={() => { setFiltro('recientes'); setPagina(1) }}
          >
            Recientes
          </button>
        </div>

        <Button variant="primary" onClick={onNewPaciente}>
          <Plus size={16} aria-hidden="true" />
          Nuevo Paciente
        </Button>
      </header>

      {pacientesPaginados.length === 0 ? (
        <div className="pacientes-empty">
          <p>No se encontraron pacientes con el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="pacientes-table-wrapper">
          <table className="pacientes-table" aria-label="Listado de pacientes">
            <thead>
              <tr>
                <th scope="col">Apellidos y Nombre</th>
                <th scope="col">Documento</th>
                <th scope="col">F. Nacimiento</th>
                <th scope="col">Contacto</th>
                <th scope="col" className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientesPaginados.map((p) => (
                <tr key={p.id}>
                  <td>
                    <button
                      type="button"
                      className="paciente-name-link"
                      onClick={() => onSelectPaciente(p)}
                    >
                      <strong>{p.apellidos}</strong>, {p.nombre}
                    </button>
                  </td>
                  <td>{p.documento}</td>
                  <td>{p.fechaNacimiento}</td>
                  <td>
                    <div className="paciente-contact-cell">
                      {p.telefono && <span>{p.telefono}</span>}
                      {p.email && <span className="paciente-contact-email">{p.email}</span>}
                      {!p.telefono && !p.email && <span className="text-muted">—</span>}
                    </div>
                  </td>
                  <td>
                    <div className="paciente-actions-cell">
                      <button
                        type="button"
                        className="btn-icon"
                        title="Ver ficha completa"
                        onClick={() => onSelectPaciente(p)}
                        aria-label={`Ver ficha de ${p.nombre} ${p.apellidos}`}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Editar datos"
                        onClick={() => onEditPaciente(p)}
                        aria-label={`Editar a ${p.nombre} ${p.apellidos}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-icon--danger"
                        title="Eliminar paciente"
                        onClick={() => onDeletePaciente(p.id)}
                        aria-label={`Eliminar a ${p.nombre} ${p.apellidos}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <footer className="pacientes-pagination">
          <span className="pagination-info">
            Página {pagina} de {totalPaginas} ({pacientesFiltrados.length} pacientes)
          </span>
          <div className="pagination-controls">
            <Button
              variant="secondary"
              disabled={pagina <= 1}
              onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>
            <Button
              variant="secondary"
              disabled={pagina >= totalPaginas}
              onClick={() => setPagina((prev) => Math.min(totalPaginas, prev + 1))}
              aria-label="Página siguiente"
            >
              Siguiente
              <ChevronRight size={16} />
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}

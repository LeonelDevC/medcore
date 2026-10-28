import { Users } from 'lucide-react'
import { Card } from '../../components/ui/Card/Card'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import './PacientesPage.styles.sass'

/** M3 Pacientes — listado paginado, ficha y CRUD (T3.3). */
export function PacientesPage() {
  return (
    <div className="pacientes-page">
      <Card>
        <EmptyState
          icon={Users}
          title="Pacientes"
          description="Listado paginado y ficha con citas, notas, estudios e informes. Contenido previsto en T3.3."
        />
      </Card>
    </div>
  )
}

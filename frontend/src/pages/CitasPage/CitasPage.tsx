import { CalendarDays } from 'lucide-react'
import { Card } from '../../components/ui/Card/Card'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import './CitasPage.styles.sass'

/** M4 Citas — agenda, creación y estados (T3.4). */
export function CitasPage() {
  return (
    <div className="citas-page">
      <Card>
        <EmptyState
          icon={CalendarDays}
          title="Citas"
          description="Agenda del día, programación de citas y estados (programada, realizada, cancelada). Contenido previsto en T3.4."
        />
      </Card>
    </div>
  )
}

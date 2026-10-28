import { LayoutDashboard } from 'lucide-react'
import { Card } from '../../components/ui/Card/Card'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import './DashboardPage.styles.sass'

/** M2 Dashboard — resumen del día y accesos rápidos (T3.2). */
export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <Card>
        <EmptyState
          icon={LayoutDashboard}
          title="Dashboard"
          description="Resumen del día (citas, actividad) y accesos rápidos según rol. Contenido previsto en T3.2."
        />
      </Card>
    </div>
  )
}

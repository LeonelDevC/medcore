import { BriefcaseMedical } from 'lucide-react'
import { Card } from '../../components/ui/Card/Card'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import './PersonalPage.styles.sass'

/** M5 Personal médico — solo admin (T3.5). */
export function PersonalPage() {
  return (
    <div className="personal-page">
      <Card>
        <EmptyState
          icon={BriefcaseMedical}
          title="Personal médico"
          description="Listado, ficha y especialidad. Módulo exclusivo de admin; el acceso real lo impide el API, no solo la UI. Contenido previsto en T3.5."
        />
      </Card>
    </div>
  )
}

import { FileText } from 'lucide-react'
import { Card } from '../../components/ui/Card/Card'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import './InformesPage.styles.sass'

/** M7 Informes médicos — borrador, firma e inmutabilidad (T5.1–T5.4). */
export function InformesPage() {
  return (
    <div className="informes-page">
      <Card>
        <EmptyState
          icon={FileText}
          title="Informes médicos"
          description="Borrador editable, firma inmutable y corrección por adenda, con vista de solo lectura e impresión del navegador. Contenido previsto en Fase 5."
        />
      </Card>
    </div>
  )
}

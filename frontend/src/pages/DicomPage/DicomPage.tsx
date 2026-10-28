import { ScanLine } from 'lucide-react'
import { Card } from '../../components/ui/Card/Card'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import './DicomPage.styles.sass'

/**
 * M6 Visor DICOM — bloqueado por T4.1 (aprobación de la librería DICOM).
 * El viewport oscuro fijo (specs §2.6/T6) se implementa en T4.3.
 */
export function DicomPage() {
  return (
    <div className="dicom-page">
      <Card>
        <EmptyState
          icon={ScanLine}
          title="Estudios DICOM"
          description="Carga de .dcm o ZIP, visor con ventana/nivel y mediciones. Bloqueado hasta que se apruebe la librería de parseo (T4.1); el resto de la fase depende de ella."
        />
      </Card>
    </div>
  )
}

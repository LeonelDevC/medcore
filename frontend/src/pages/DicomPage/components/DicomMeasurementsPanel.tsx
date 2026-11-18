import { Trash2, Save } from 'lucide-react'
import { Card } from '../../../components/ui/Card/Card'
import { Button } from '../../../components/ui/Button/Button'
import type { Medicion, Role } from '../../../types'

type DicomMeasurementsPanelProps = {
  measurements: Medicion[]
  role: Role | null
  saveSuccess: boolean
  onDeleteMeasurement: (id: string) => void
  onSaveToBackend: () => void
}

/**
 * Subcomponente para listar y persistir mediciones geométricas (M6).
 */
export function DicomMeasurementsPanel({
  measurements,
  role,
  saveSuccess,
  onDeleteMeasurement,
  onSaveToBackend,
}: DicomMeasurementsPanelProps) {
  return (
    <Card>
      <div className="dicom-page__panel-section">
        <h2 className="dicom-page__section-title">Mediciones ({measurements.length})</h2>

        {measurements.length === 0 ? (
          <p className="dicom-page__empty-measurements">
            No se han registrado mediciones en este estudio. Seleccione Regla o Ángulo para comenzar.
          </p>
        ) : (
          <div className="dicom-page__measurements-list">
            {measurements.map((m, idx) => (
              <div key={m.id} className="dicom-page__measurement-item">
                <div className="dicom-page__measurement-info">
                  <div className="dicom-page__measurement-type">
                    <span>
                      #{idx + 1} {m.tipo.toUpperCase()}
                    </span>
                    <span
                      className={`dicom-page__calib-tag ${
                        m.calibrada
                          ? 'dicom-page__calib-tag--calibrated'
                          : 'dicom-page__calib-tag--uncalibrated'
                      }`}
                    >
                      {m.calibrada ? 'CALIBRADA' : 'SIN CALIBRACIÓN'}
                    </span>
                  </div>
                  <div className="dicom-page__measurement-value">
                    {m.valor.toFixed(1)} {m.unidad}
                  </div>
                </div>

                {role === 'medico' && (
                  <button
                    type="button"
                    onClick={() => onDeleteMeasurement(m.id)}
                    className="dicom-page__delete-btn"
                    title="Eliminar medición"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {measurements.length > 0 && role === 'medico' && (
          <Button variant="primary" size="sm" onClick={onSaveToBackend}>
            <Save size={15} />
            <span>{saveSuccess ? '¡Guardado en estudio!' : 'Persistir mediciones'}</span>
          </Button>
        )}
      </div>
    </Card>
  )
}

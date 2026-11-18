import { ChevronLeft, Activity, Layers, FileEdit, CheckCircle2 } from 'lucide-react'
import type { FormEvent } from 'react'
import { Card } from '../../../components/ui/Card/Card'
import { Button } from '../../../components/ui/Button/Button'
import type { Estudio, Paciente } from '../../../types'

type InformeEditorProps = {
  isCreating: boolean
  isEditingDraft: boolean
  selectedInformeId: string | null
  pacientes: Paciente[]
  estudios: Estudio[]
  formPacienteId: string
  setFormPacienteId: (id: string) => void
  formEstudioId: string
  setFormEstudioId: (id: string) => void
  formMotivo: string
  setFormMotivo: (val: string) => void
  formHallazgos: string
  setFormHallazgos: (val: string) => void
  formConclusion: string
  setFormConclusion: (val: string) => void
  formRecomendaciones: string
  setFormRecomendaciones: (val: string) => void
  onCancel: () => void
  onSaveDraft: (e?: FormEvent) => void
  onSignInforme: () => void
  onInsertMeasurements: () => void
}

/**
 * Subcomponente de edición / creación de borrador de informe médico.
 * Vincula estudios de M6 e inyecta mediciones calibradas/no-calibradas.
 */
export function InformeEditor({
  isCreating,
  isEditingDraft,
  selectedInformeId,
  pacientes,
  estudios,
  formPacienteId,
  setFormPacienteId,
  formEstudioId,
  setFormEstudioId,
  formMotivo,
  setFormMotivo,
  formHallazgos,
  setFormHallazgos,
  formConclusion,
  setFormConclusion,
  formRecomendaciones,
  setFormRecomendaciones,
  onCancel,
  onSaveDraft,
  onSignInforme,
  onInsertMeasurements,
}: InformeEditorProps) {
  const estudioSeleccionado = estudios.find((e) => e.id === formEstudioId)
  const numMediciones = estudioSeleccionado?.mediciones?.length || 0

  return (
    <Card className="informes-page__editor-card no-print">
      <div className="informes-page__editor-header">
        <button type="button" className="informes-page__back-btn" onClick={onCancel}>
          <ChevronLeft size={16} />
          <span>Volver al listado</span>
        </button>
        <h2 className="informes-page__editor-title">
          {isCreating ? 'Redactar nuevo borrador' : `Editando borrador (${selectedInformeId})`}
        </h2>
      </div>

      <form onSubmit={onSaveDraft} className="informes-page__form">
        <div className="informes-page__form-grid">
          {/* Paciente */}
          <div className="informes-page__field">
            <label htmlFor="informe-paciente" className="informes-page__label">
              Paciente <span className="informes-page__required">*</span>
            </label>
            <select
              id="informe-paciente"
              value={formPacienteId}
              onChange={(e) => {
                setFormPacienteId(e.target.value)
                setFormEstudioId('')
              }}
              className="informes-page__select"
              required
            >
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellidos}, {p.nombre} ({p.documento})
                </option>
              ))}
            </select>
          </div>

          {/* Estudio DICOM vinculado (M6 -> M7) */}
          <div className="informes-page__field">
            <label htmlFor="informe-estudio" className="informes-page__label">
              Estudio DICOM asociado (opcional)
            </label>
            <select
              id="informe-estudio"
              value={formEstudioId}
              onChange={(e) => setFormEstudioId(e.target.value)}
              className="informes-page__select"
            >
              <option value="">Sin estudio vinculado</option>
              {estudios
                .filter((e) => e.pacienteId === formPacienteId)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.modalidad} — {e.descripcion} ({e.fechaEstudio})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Inserción rápida de mediciones si el estudio tiene */}
        {formEstudioId && (
          <div className="informes-page__study-banner">
            <div className="informes-page__study-banner-info">
              <Activity size={16} />
              <span>
                El estudio seleccionado contiene <strong>{numMediciones} mediciones</strong> registradas
                en el visor DICOM.
              </span>
            </div>
            {numMediciones > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onInsertMeasurements}
                className="informes-page__insert-measurements-btn"
              >
                <Layers size={14} />
                <span>Insertar mediciones en hallazgos</span>
              </Button>
            )}
          </div>
        )}

        {/* Motivo */}
        <div className="informes-page__field">
          <label htmlFor="informe-motivo" className="informes-page__label">
            Motivo de la indicación clínica <span className="informes-page__required">*</span>
          </label>
          <input
            id="informe-motivo"
            type="text"
            value={formMotivo}
            onChange={(e) => setFormMotivo(e.target.value)}
            placeholder="Ej. Sospecha de consolidación pulmonar o dolor torácico"
            className="informes-page__input"
            required
          />
        </div>

        {/* Hallazgos */}
        <div className="informes-page__field">
          <label htmlFor="informe-hallazgos" className="informes-page__label">
            Hallazgos radiológicos / clínicos
          </label>
          <textarea
            id="informe-hallazgos"
            value={formHallazgos}
            onChange={(e) => setFormHallazgos(e.target.value)}
            rows={4}
            placeholder="Descripción detallada de estructuras anatómicas observadas..."
            className="informes-page__textarea"
          />
        </div>

        {/* Conclusión */}
        <div className="informes-page__field">
          <label htmlFor="informe-conclusion" className="informes-page__label">
            Conclusión diagnóstica
          </label>
          <textarea
            id="informe-conclusion"
            value={formConclusion}
            onChange={(e) => setFormConclusion(e.target.value)}
            rows={3}
            placeholder="Diagnóstico radiológico principal..."
            className="informes-page__textarea"
          />
        </div>

        {/* Recomendaciones */}
        <div className="informes-page__field">
          <label htmlFor="informe-recomendaciones" className="informes-page__label">
            Recomendaciones / Seguimiento
          </label>
          <textarea
            id="informe-recomendaciones"
            value={formRecomendaciones}
            onChange={(e) => setFormRecomendaciones(e.target.value)}
            rows={2}
            placeholder="Estudios complementarios sugeridos, citas de control..."
            className="informes-page__textarea"
          />
        </div>

        {/* Botones de acción del formulario */}
        <div className="informes-page__form-actions">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>

          <div className="informes-page__form-actions-right">
            <Button type="submit" variant="secondary">
              <FileEdit size={16} />
              <span>Guardar borrador</span>
            </Button>

            {isEditingDraft && (
              <Button
                type="button"
                variant="primary"
                onClick={onSignInforme}
                className="informes-page__sign-btn"
              >
                <CheckCircle2 size={16} />
                <span>Firmar informe</span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  )
}

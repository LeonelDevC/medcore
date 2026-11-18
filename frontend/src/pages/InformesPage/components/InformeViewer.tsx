import {
  ChevronLeft,
  FileEdit,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Clock,
  User,
  Calendar,
  Activity,
  Layers,
  Plus,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { Card } from '../../../components/ui/Card/Card'
import { Button } from '../../../components/ui/Button/Button'
import type { Informe, Role } from '../../../types'

type InformeViewerProps = {
  informe: Informe
  role: Role | null
  getPacienteNombre: (id: string) => string
  getEstudioDescripcion: (id?: string) => string
  onBack: () => void
  onEditDraft: () => void
  onSignInforme: () => void
  onPrint: () => void
  isAddingAdenda: boolean
  setIsAddingAdenda: (val: boolean) => void
  adendaTexto: string
  setAdendaTexto: (val: string) => void
  adendaError: string | null
  setAdendaError: (val: string | null) => void
  onAddAdenda: (e: FormEvent) => void
}

/**
 * Subcomponente de visualización clínica de informe e impresión.
 * Oculta acciones restringidas para 'admin' y gestiona adendas.
 */
export function InformeViewer({
  informe,
  role,
  getPacienteNombre,
  getEstudioDescripcion,
  onBack,
  onEditDraft,
  onSignInforme,
  onPrint,
  isAddingAdenda,
  setIsAddingAdenda,
  adendaTexto,
  setAdendaTexto,
  adendaError,
  setAdendaError,
  onAddAdenda,
}: InformeViewerProps) {
  return (
    <article className="informes-page__viewer">
      {/* Barra de herramientas superior (no imprimible) */}
      <div className="informes-page__viewer-toolbar no-print">
        <button type="button" className="informes-page__back-btn" onClick={onBack}>
          <ChevronLeft size={16} />
          <span>Volver a la lista</span>
        </button>

        <div className="informes-page__viewer-actions">
          {/* Si es borrador y es médico: botón editar y firmar */}
          {informe.estado === 'borrador' && role === 'medico' && (
            <>
              <Button variant="secondary" size="sm" onClick={onEditDraft}>
                <FileEdit size={15} />
                <span>Editar borrador</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onSignInforme}
                className="informes-page__sign-btn"
              >
                <CheckCircle2 size={15} />
                <span>Firmar</span>
              </Button>
            </>
          )}

          {/* Botón de impresión nativa (C12, SSDD M7) */}
          <Button variant="ghost" size="sm" onClick={onPrint} className="informes-page__print-btn">
            <Printer size={15} />
            <span>Imprimir</span>
          </Button>
        </div>
      </div>

      {/* Documento Clínico (sección impresa limpia) */}
      <Card className="informes-page__document">
        <header className="informes-page__doc-header">
          <div className="informes-page__doc-header-main">
            <div className="informes-page__doc-badge-group">
              <span className={`informes-page__badge informes-page__badge--${informe.estado}`}>
                {informe.estado === 'firmado' ? (
                  <>
                    <ShieldCheck size={14} />
                    <span>Firmado</span>
                  </>
                ) : (
                  <>
                    <Clock size={14} />
                    <span>Borrador</span>
                  </>
                )}
              </span>
              <span className="informes-page__doc-id">{informe.id}</span>
            </div>
            <h2 className="informes-page__doc-title">Informe Clínico Radiológico</h2>
          </div>

          {/* Metadatos del informe */}
          <div className="informes-page__doc-meta-grid">
            <div className="informes-page__doc-meta-item">
              <span className="informes-page__doc-meta-label">
                <User size={13} /> Paciente:
              </span>
              <strong className="informes-page__doc-meta-val">
                {getPacienteNombre(informe.pacienteId)}
              </strong>
            </div>

            <div className="informes-page__doc-meta-item">
              <span className="informes-page__doc-meta-label">
                <Calendar size={13} /> Fecha creación:
              </span>
              <span className="informes-page__doc-meta-val">
                {new Date(informe.creadoEn).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="informes-page__doc-meta-item">
              <span className="informes-page__doc-meta-label">
                <Activity size={13} /> Médico responsable:
              </span>
              <span className="informes-page__doc-meta-val">{informe.medicoId}</span>
            </div>

            <div className="informes-page__doc-meta-item">
              <span className="informes-page__doc-meta-label">
                <Layers size={13} /> Estudio vinculado:
              </span>
              <span className="informes-page__doc-meta-val">
                {getEstudioDescripcion(informe.estudioId)}
              </span>
            </div>

            {informe.firmadoEn && (
              <div className="informes-page__doc-meta-item informes-page__doc-meta-item--highlight">
                <span className="informes-page__doc-meta-label">
                  <ShieldCheck size={13} /> Firma inmutable:
                </span>
                <span className="informes-page__doc-meta-val">
                  {new Date(informe.firmadoEn).toLocaleString('es-ES')}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Contenido del informe */}
        <div className="informes-page__doc-body">
          <section className="informes-page__doc-section">
            <h3 className="informes-page__doc-section-title">Motivo de la indicación</h3>
            <p className="informes-page__doc-section-text">{informe.motivo}</p>
          </section>

          <section className="informes-page__doc-section">
            <h3 className="informes-page__doc-section-title">Hallazgos radiológicos</h3>
            <p className="informes-page__doc-section-text informes-page__doc-section-text--pre">
              {informe.hallazgos || 'Sin hallazgos específicos redactados.'}
            </p>
          </section>

          <section className="informes-page__doc-section">
            <h3 className="informes-page__doc-section-title">Conclusión diagnóstica</h3>
            <p className="informes-page__doc-section-text">
              {informe.conclusion || 'Pendiente de conclusión diagnóstica.'}
            </p>
          </section>

          {informe.recomendaciones && (
            <section className="informes-page__doc-section">
              <h3 className="informes-page__doc-section-title">Recomendaciones y seguimiento</h3>
              <p className="informes-page__doc-section-text">{informe.recomendaciones}</p>
            </section>
          )}

          {/* Sección de Adendas (M7: correcciones aditivas a informes firmados) */}
          <section className="informes-page__adendas-section">
            <div className="informes-page__adendas-header">
              <h3 className="informes-page__doc-section-title">
                Adendas y aclaraciones ({informe.adendas.length})
              </h3>

              {/* Botón de añadir adenda: solo en informes firmados y solo rol médico */}
              {informe.estado === 'firmado' && role === 'medico' && !isAddingAdenda && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddingAdenda(true)}
                  className="no-print"
                >
                  <Plus size={14} />
                  <span>Añadir adenda</span>
                </Button>
              )}
            </div>

            {/* Formulario para agregar adenda */}
            {isAddingAdenda && role === 'medico' && (
              <form onSubmit={onAddAdenda} className="informes-page__adenda-form no-print">
                <label htmlFor="adenda-texto" className="informes-page__label">
                  Nueva adenda referenciada (inmutable una vez guardada):
                </label>
                <textarea
                  id="adenda-texto"
                  value={adendaTexto}
                  onChange={(e) => setAdendaTexto(e.target.value)}
                  rows={3}
                  placeholder="Indique la aclaración o dato correctivo sobre el estudio..."
                  className="informes-page__textarea"
                  required
                />
                {adendaError && <p className="informes-page__error-msg">{adendaError}</p>}
                <div className="informes-page__adenda-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingAdenda(false)
                      setAdendaError(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Registrar adenda
                  </Button>
                </div>
              </form>
            )}

            {/* Lista cronológica de adendas */}
            {informe.adendas.length > 0 ? (
              <div className="informes-page__adendas-list">
                {informe.adendas.map((adn, idx) => (
                  <div key={adn.id} className="informes-page__adenda-item">
                    <div className="informes-page__adenda-meta">
                      <span className="informes-page__adenda-idx">Adenda #{idx + 1}</span>
                      <span className="informes-page__adenda-author">Autor: {adn.autorId}</span>
                      <span className="informes-page__adenda-date">
                        {new Date(adn.creadaEn).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <p className="informes-page__adenda-text">{adn.texto}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="informes-page__adendas-empty">
                No se han registrado adendas sobre este informe.
              </p>
            )}
          </section>
        </div>
      </Card>
    </article>
  )
}

import { useState, useEffect, type FormEvent } from 'react'
import { FileText, Plus, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button/Button'
import { getRole, subscribeRole } from '../../lib/session'
import { apiFetch } from '../../lib/api'
import type { Informe, InformeInput, Adenda, AdendaInput, Role, Estudio, Paciente } from '../../types'
import { InformesList, type EstadoFiltro } from './components/InformesList'
import { InformeEditor } from './components/InformeEditor'
import { InformeViewer } from './components/InformeViewer'
import './InformesPage.styles.sass'

// Datos semilla de respaldo para desarrollo y tests E2E aislados
const SEED_PACIENTES: Paciente[] = [
  {
    id: 'pac-001',
    nombre: 'Carmen',
    apellidos: 'García López',
    documento: '45892147K',
    fechaNacimiento: '1978-04-12',
    telefono: '611223344',
    email: 'carmen.garcia@example.com',
    creadoEn: '2026-01-10T09:00:00Z',
  },
  {
    id: 'pac-002',
    nombre: 'Alejandro',
    apellidos: 'Rodríguez Sanz',
    documento: '38914562B',
    fechaNacimiento: '1965-11-23',
    telefono: '622334455',
    email: 'alejandro.rodriguez@example.com',
    creadoEn: '2026-02-14T11:30:00Z',
  },
]

const SEED_ESTUDIOS: Estudio[] = [
  {
    id: 'est-001',
    pacienteId: 'pac-001',
    medicoId: 'med-001',
    modalidad: 'CR',
    descripcion: 'Radiografía de Tórax PA y Lateral',
    fechaEstudio: '2026-03-01',
    numeroCortes: 1,
    ancho: 512,
    alto: 512,
    pixelSpacing: [0.15, 0.15],
    mediciones: [
      {
        id: 'med-101',
        tipo: 'distancia',
        valor: 14.8,
        unidad: 'mm',
        calibrada: true,
        creadaEn: '2026-03-01T10:15:00Z',
      },
      {
        id: 'med-102',
        tipo: 'angulo',
        valor: 42.5,
        unidad: 'grados',
        calibrada: false,
        creadaEn: '2026-03-01T10:18:00Z',
      },
    ],
    creadoEn: '2026-03-01T10:00:00Z',
  },
  {
    id: 'est-002',
    pacienteId: 'pac-002',
    medicoId: 'med-001',
    modalidad: 'DX',
    descripcion: 'Radiografía de Columna Lumbar',
    fechaEstudio: '2026-03-02',
    numeroCortes: 1,
    ancho: 512,
    alto: 512,
    mediciones: [
      {
        id: 'med-201',
        tipo: 'distancia',
        valor: 85.0,
        unidad: 'px',
        calibrada: false,
        creadaEn: '2026-03-02T12:00:00Z',
      },
    ],
    creadoEn: '2026-03-02T11:45:00Z',
  },
]

const SEED_INFORMES: Informe[] = [
  {
    id: 'inf-001',
    pacienteId: 'pac-001',
    estudioId: 'est-001',
    medicoId: 'Dr. Martín Valdés',
    motivo: 'Evaluación de dolor torácico recurrente y disnea leve.',
    hallazgos:
      'Campos pulmonares adecuadamente expandidos sin consolidaciones activas. Silueta cardiaca dentro de límites normales. Medición de nódulo apical: 14.8 mm (calibrada con PixelSpacing).',
    conclusion: 'Estudio sin hallazgos agudos pleuropulmonares de significación patológica actual.',
    recomendaciones: 'Control evolutivo en 6 meses si persisten los síntomas respiratorios.',
    estado: 'firmado',
    creadoEn: '2026-03-01T10:30:00Z',
    actualizadoEn: '2026-03-01T11:00:00Z',
    firmadoEn: '2026-03-01T11:00:00Z',
    adendas: [
      {
        id: 'adn-001',
        texto: 'Se compara con placa previa de 2024: estabilidad total de los diámetros observados.',
        autorId: 'Dr. Martín Valdés',
        creadaEn: '2026-03-01T16:30:00Z',
      },
    ],
  },
  {
    id: 'inf-002',
    pacienteId: 'pac-002',
    estudioId: 'est-002',
    medicoId: 'Dra. Elena Ramos',
    motivo: 'Lumbalgia mecánica con irradiación a miembro inferior izquierdo.',
    hallazgos:
      'Leve disminución del espacio intervertebral L5-S1. No se observan fracturas ni listesis óseas agudas.',
    conclusion: 'Discopatía incipiente L5-S1 compatible con sintomatología mecánica.',
    recomendaciones: 'Fisioterapia pélvica y analgesia pautada según dolor.',
    estado: 'borrador',
    creadoEn: '2026-03-02T12:30:00Z',
    actualizadoEn: '2026-03-02T12:30:00Z',
    adendas: [],
  },
]

export function InformesPage() {
  const [role, setRoleState] = useState<Role | null>(getRole())
  const [informes, setInformes] = useState<Informe[]>(SEED_INFORMES)
  const [pacientes] = useState<Paciente[]>(SEED_PACIENTES)
  const [estudios] = useState<Estudio[]>(SEED_ESTUDIOS)

  // Filtros contextuales (C4)
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('todos')
  const [filtroPaciente, setFiltroPaciente] = useState<string>('todos')

  // Estado de navegación en la pantalla
  const [selectedInformeId, setSelectedInformeId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isEditingDraft, setIsEditingDraft] = useState<boolean>(false)

  // Formulario de edición/creación
  const [formPacienteId, setFormPacienteId] = useState<string>('pac-001')
  const [formEstudioId, setFormEstudioId] = useState<string>('')
  const [formMotivo, setFormMotivo] = useState<string>('')
  const [formHallazgos, setFormHallazgos] = useState<string>('')
  const [formConclusion, setFormConclusion] = useState<string>('')
  const [formRecomendaciones, setFormRecomendaciones] = useState<string>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Formulario de nueva adenda
  const [isAddingAdenda, setIsAddingAdenda] = useState<boolean>(false)
  const [adendaTexto, setAdendaTexto] = useState<string>('')
  const [adendaError, setAdendaError] = useState<string | null>(null)

  // Subscribirse a cambios de rol
  useEffect(() => {
    return subscribeRole(() => setRoleState(getRole()))
  }, [])

  // Sincronizar informes desde el backend Go si está disponible
  useEffect(() => {
    let active = true
    apiFetch<Informe[]>('/api/v1/informes')
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setInformes(data)
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const selectedInforme = informes.find((inf) => inf.id === selectedInformeId) || null

  const getPacienteNombre = (pacienteId: string) => {
    const pac = pacientes.find((p) => p.id === pacienteId)
    return pac ? `${pac.apellidos}, ${pac.nombre}` : pacienteId
  }

  const getEstudioDescripcion = (estudioId?: string) => {
    if (!estudioId) return 'Sin estudio vinculado'
    const est = estudios.find((e) => e.id === estudioId)
    return est ? `${est.modalidad} — ${est.descripcion}` : estudioId
  }

  // Iniciar creación de nuevo informe (solo médico)
  const handleStartCreate = () => {
    if (role !== 'medico') return
    setIsCreating(true)
    setIsEditingDraft(false)
    setSelectedInformeId(null)
    setFormPacienteId(pacientes[0]?.id || '')
    setFormEstudioId('')
    setFormMotivo('')
    setFormHallazgos('')
    setFormConclusion('')
    setFormRecomendaciones('')
    setFormError(null)
    setFormSuccess(null)
  }

  // Abrir borrador existente para edición (solo médico)
  const handleStartEditDraft = (informe: Informe) => {
    if (role !== 'medico' || informe.estado !== 'borrador') return
    setIsCreating(false)
    setIsEditingDraft(true)
    setSelectedInformeId(informe.id)
    setFormPacienteId(informe.pacienteId)
    setFormEstudioId(informe.estudioId || '')
    setFormMotivo(informe.motivo)
    setFormHallazgos(informe.hallazgos)
    setFormConclusion(informe.conclusion)
    setFormRecomendaciones(informe.recomendaciones)
    setFormError(null)
    setFormSuccess(null)
  }

  // Insertar mediciones de M6 en los hallazgos
  const handleInsertMeasurements = () => {
    if (!formEstudioId) return
    const estudio = estudios.find((e) => e.id === formEstudioId)
    if (!estudio || !estudio.mediciones || estudio.mediciones.length === 0) return

    const textoMediciones = estudio.mediciones
      .map((m, idx) => {
        const estadoCalibrado = m.calibrada ? 'calibrada con PixelSpacing' : 'sin calibración previa'
        return `• Medición ${idx + 1} (${m.tipo}): ${m.valor.toFixed(1)} ${m.unidad} (${estadoCalibrado})`
      })
      .join('\n')

    setFormHallazgos((prev) =>
      prev ? `${prev}\n\n[Mediciones DICOM]:\n${textoMediciones}` : `[Mediciones DICOM]:\n${textoMediciones}`,
    )
  }

  // Guardar borrador (POST o PUT)
  const handleSaveDraft = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    if (role !== 'medico') return

    if (!formMotivo.trim()) {
      setFormError('El motivo del informe es obligatorio.')
      return
    }

    const payload: InformeInput = {
      pacienteId: formPacienteId,
      estudioId: formEstudioId || undefined,
      medicoId: 'Dr. Martín Valdés',
      motivo: formMotivo.trim(),
      hallazgos: formHallazgos.trim(),
      conclusion: formConclusion.trim(),
      recomendaciones: formRecomendaciones.trim(),
    }

    try {
      if (isCreating) {
        let nuevoInforme: Informe
        try {
          const res = await apiFetch<Informe>('/api/v1/informes', {
            method: 'POST',
            body: payload,
          })
          if (res && res.id) {
            nuevoInforme = res
          } else {
            throw new Error('No backend payload')
          }
        } catch {
          nuevoInforme = {
            id: `inf-${Date.now()}`,
            ...payload,
            estado: 'borrador',
            creadoEn: new Date().toISOString(),
            actualizadoEn: new Date().toISOString(),
            adendas: [],
          }
        }
        setInformes((prev) => [nuevoInforme, ...prev])
        setSelectedInformeId(nuevoInforme.id)
        setIsCreating(false)
        setIsEditingDraft(false)
        setFormSuccess('Borrador creado satisfactoriamente.')
      } else if (isEditingDraft && selectedInformeId) {
        let informeActualizado: Informe
        try {
          const res = await apiFetch<Informe>(`/api/v1/informes/${selectedInformeId}`, {
            method: 'PUT',
            body: payload,
          })
          if (res && res.id) {
            informeActualizado = res
          } else {
            throw new Error('No backend payload')
          }
        } catch {
          informeActualizado = {
            ...selectedInforme!,
            ...payload,
            actualizadoEn: new Date().toISOString(),
          }
        }
        setInformes((prev) => prev.map((inf) => (inf.id === selectedInformeId ? informeActualizado : inf)))
        setIsEditingDraft(false)
        setFormSuccess('Borrador actualizado con éxito.')
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar el borrador.')
    }
  }

  // Firmar informe (Transición a firmado e inmutable)
  const handleSignInforme = async () => {
    if (role !== 'medico' || !selectedInformeId) return

    try {
      let informeFirmado: Informe
      try {
        const res = await apiFetch<Informe>(`/api/v1/informes/${selectedInformeId}/firma`, {
          method: 'POST',
        })
        if (res && res.id) {
          informeFirmado = res
        } else {
          throw new Error('No backend payload')
        }
      } catch {
        const target = informes.find((i) => i.id === selectedInformeId)!
        informeFirmado = {
          ...target,
          estado: 'firmado',
          firmadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        }
      }

      setInformes((prev) => prev.map((inf) => (inf.id === selectedInformeId ? informeFirmado : inf)))
      setIsEditingDraft(false)
      setIsCreating(false)
      setFormSuccess('Informe firmado debidamente. El documento es ahora inmutable.')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al firmar el informe.')
    }
  }

  // Añadir adenda a un informe firmado
  const handleAddAdenda = async (e: FormEvent) => {
    e.preventDefault()
    if (role !== 'medico' || !selectedInformeId) return

    if (!adendaTexto.trim()) {
      setAdendaError('El texto de la adenda no puede estar vacío.')
      return
    }

    const payload: AdendaInput = {
      texto: adendaTexto.trim(),
      autorId: 'Dr. Martín Valdés',
    }

    try {
      let updated: Informe
      try {
        const res = await apiFetch<Informe>(`/api/v1/informes/${selectedInformeId}/adendas`, {
          method: 'POST',
          body: payload,
        })
        if (res && res.id) {
          updated = res
        } else {
          throw new Error('No backend payload')
        }
      } catch {
        const target = informes.find((i) => i.id === selectedInformeId)!
        const newAdenda: Adenda = {
          id: `adn-${Date.now()}`,
          texto: payload.texto,
          autorId: payload.autorId,
          creadaEn: new Date().toISOString(),
        }
        updated = {
          ...target,
          adendas: [...target.adendas, newAdenda],
          actualizadoEn: new Date().toISOString(),
        }
      }

      setInformes((prev) => prev.map((inf) => (inf.id === selectedInformeId ? updated : inf)))
      setAdendaTexto('')
      setIsAddingAdenda(false)
      setAdendaError(null)
    } catch (err) {
      setAdendaError(err instanceof Error ? err.message : 'Error al registrar la adenda.')
    }
  }

  return (
    <div className="informes-page">
      {/* Cabecera principal */}
      <header className="informes-page__header no-print">
        <div className="informes-page__title-group">
          <div className="informes-page__title-row">
            <FileText className="informes-page__header-icon" size={24} />
            <h2 className="informes-page__title">Informes médicos</h2>
          </div>
          <p className="informes-page__subtitle">
            Ciclo clínico de informes: borrador editable, firma inmutable y adendas referenciadas (M7).
          </p>
        </div>

        {/* Botón Nuevo Informe: EXCLUSIVO rol médico */}
        {role === 'medico' && !isCreating && !isEditingDraft && (
          <Button
            variant="primary"
            size="md"
            onClick={handleStartCreate}
            className="informes-page__new-btn"
          >
            <Plus size={16} />
            <span>Nuevo informe</span>
          </Button>
        )}
      </header>

      {/* Alertas */}
      {formSuccess && (
        <div className="informes-page__alert informes-page__alert--success no-print" role="status">
          <CheckCircle2 size={16} />
          <span>{formSuccess}</span>
          <button type="button" className="informes-page__alert-close" onClick={() => setFormSuccess(null)}>
            ×
          </button>
        </div>
      )}

      {formError && (
        <div className="informes-page__alert informes-page__alert--danger no-print" role="alert">
          <AlertCircle size={16} />
          <span>{formError}</span>
          <button type="button" className="informes-page__alert-close" onClick={() => setFormError(null)}>
            ×
          </button>
        </div>
      )}

      {/* Selector de subcomponentes */}
      {(isCreating || isEditingDraft) && role === 'medico' ? (
        <InformeEditor
          isCreating={isCreating}
          isEditingDraft={isEditingDraft}
          selectedInformeId={selectedInformeId}
          pacientes={pacientes}
          estudios={estudios}
          formPacienteId={formPacienteId}
          setFormPacienteId={setFormPacienteId}
          formEstudioId={formEstudioId}
          setFormEstudioId={setFormEstudioId}
          formMotivo={formMotivo}
          setFormMotivo={setFormMotivo}
          formHallazgos={formHallazgos}
          setFormHallazgos={setFormHallazgos}
          formConclusion={formConclusion}
          setFormConclusion={setFormConclusion}
          formRecomendaciones={formRecomendaciones}
          setFormRecomendaciones={setFormRecomendaciones}
          onCancel={() => {
            setIsCreating(false)
            setIsEditingDraft(false)
          }}
          onSaveDraft={handleSaveDraft}
          onSignInforme={handleSignInforme}
          onInsertMeasurements={handleInsertMeasurements}
        />
      ) : selectedInforme ? (
        <InformeViewer
          informe={selectedInforme}
          role={role}
          getPacienteNombre={getPacienteNombre}
          getEstudioDescripcion={getEstudioDescripcion}
          onBack={() => setSelectedInformeId(null)}
          onEditDraft={() => handleStartEditDraft(selectedInforme)}
          onSignInforme={handleSignInforme}
          onPrint={() => window.print()}
          isAddingAdenda={isAddingAdenda}
          setIsAddingAdenda={setIsAddingAdenda}
          adendaTexto={adendaTexto}
          setAdendaTexto={setAdendaTexto}
          adendaError={adendaError}
          setAdendaError={setAdendaError}
          onAddAdenda={handleAddAdenda}
        />
      ) : (
        <InformesList
          informes={informes}
          pacientes={pacientes}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          filtroPaciente={filtroPaciente}
          setFiltroPaciente={setFiltroPaciente}
          onSelectInforme={(id) => setSelectedInformeId(id)}
          getPacienteNombre={getPacienteNombre}
        />
      )}
    </div>
  )
}

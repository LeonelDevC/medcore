import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card/Card'
import { apiFetch } from '../../lib/api'
import type { Cita, CitaInput, EstadoCita, Paciente, Personal } from '../../types'
import { CitasAgenda } from './components/CitasAgenda'
import { CitaModal } from './components/CitaModal'
import './CitasPage.styles.sass'

const INITIAL_CITAS: Cita[] = [
  {
    id: 'cit_01',
    pacienteId: 'pac_01',
    medicoId: 'med_01',
    fecha: '2026-11-20T09:30:00Z',
    motivo: 'Radiografía de tórax por dolor recurrente',
    estado: 'programada',
    creadaEn: '2026-11-15T08:00:00Z',
  },
  {
    id: 'cit_02',
    pacienteId: 'pac_02',
    medicoId: 'med_01',
    fecha: '2026-11-19T11:00:00Z',
    motivo: 'Control post-cirugía de radio y evaluación de movilidad',
    estado: 'realizada',
    creadaEn: '2026-11-14T09:00:00Z',
  },
  {
    id: 'cit_03',
    pacienteId: 'pac_03',
    medicoId: 'med_01',
    fecha: '2026-11-18T16:00:00Z',
    motivo: 'Consulta previa suspendida por el paciente',
    estado: 'cancelada',
    creadaEn: '2026-11-10T11:00:00Z',
  },
]

const INITIAL_PACIENTES: Paciente[] = [
  {
    id: 'pac_01',
    nombre: 'Elena',
    apellidos: 'García Lorca',
    documento: '48291034A',
    fechaNacimiento: '1984-06-12',
    creadoEn: '2026-11-10T10:00:00Z',
  },
  {
    id: 'pac_02',
    nombre: 'Carlos',
    apellidos: 'Ruiz Zafón',
    documento: '51928374B',
    fechaNacimiento: '1976-11-23',
    creadoEn: '2026-11-05T09:30:00Z',
  },
  {
    id: 'pac_03',
    nombre: 'Marina',
    apellidos: 'Vega Morales',
    documento: '09283746C',
    fechaNacimiento: '1992-03-08',
    creadoEn: '2026-10-28T14:15:00Z',
  },
]

const INITIAL_PERSONAL: Personal[] = [
  {
    id: 'med_01',
    nombre: 'Alejandro',
    apellidos: 'Morales Gil',
    email: 'alejandro.morales@hospital.es',
    especialidad: 'Radiología',
    rol: 'medico',
    activo: true,
    creadoEn: '2026-01-01T00:00:00Z',
  },
]

export function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>(INITIAL_CITAS)
  const [pacientes, setPacientes] = useState<Paciente[]>(INITIAL_PACIENTES)
  const [personal, setPersonal] = useState<Personal[]>(INITIAL_PERSONAL)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const resCitas = await apiFetch<Cita[]>('/api/v1/citas')
        if (isMounted && Array.isArray(resCitas) && resCitas.length > 0) {
          setCitas(resCitas)
        }
      } catch {
        // Fallback local
      }

      try {
        const resPac = await apiFetch<Paciente[]>('/api/v1/pacientes')
        if (isMounted && Array.isArray(resPac) && resPac.length > 0) {
          setPacientes(resPac)
        }
      } catch {
        // Fallback local
      }

      try {
        const resPer = await apiFetch<Personal[]>('/api/v1/personal')
        if (isMounted && Array.isArray(resPer) && resPer.length > 0) {
          setPersonal(resPer)
        }
      } catch {
        // Fallback local
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [])

  const handleNewCita = async (input: CitaInput) => {
    const newId = `cit_${Date.now()}`
    const nuevaCita: Cita = {
      id: newId,
      ...input,
      creadaEn: new Date().toISOString(),
    }

    try {
      const created = await apiFetch<Cita>('/api/v1/citas', {
        method: 'POST',
        body: input,
      })
      setCitas((prev) => [created?.id ? created : nuevaCita, ...prev])
    } catch {
      setCitas((prev) => [nuevaCita, ...prev])
    }
  }

  const handleUpdateEstado = async (id: string, nuevoEstado: EstadoCita) => {
    try {
      const updated = await apiFetch<Cita>(`/api/v1/citas/${id}`, {
        method: 'PATCH',
        body: { estado: nuevoEstado },
      })
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? (updated?.id ? updated : { ...c, estado: nuevoEstado }) : c))
      )
    } catch {
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
      )
    }
  }

  return (
    <div className="citas-page">
      <Card>
        <CitasAgenda
          citas={citas}
          pacientes={pacientes}
          onNewCita={() => setModalOpen(true)}
          onUpdateEstado={handleUpdateEstado}
        />
      </Card>

      <CitaModal
        isOpen={modalOpen}
        pacientes={pacientes}
        personal={personal}
        onClose={() => setModalOpen(false)}
        onSave={handleNewCita}
      />
    </div>
  )
}

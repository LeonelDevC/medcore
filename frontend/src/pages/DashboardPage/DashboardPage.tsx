import { useState, useEffect } from 'react'
import { useRole } from '../../hooks/useRole'
import { apiFetch } from '../../lib/api'
import type { Cita, Paciente } from '../../types'
import { DashboardMetrics } from './components/DashboardMetrics'
import { DashboardAgendaWidget } from './components/DashboardAgendaWidget'
import { DashboardQuickActions } from './components/DashboardQuickActions'
import './DashboardPage.styles.sass'

const DEFAULT_CITAS: Cita[] = [
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
    fecha: '2026-11-20T11:00:00Z',
    motivo: 'Control post-cirugía de radio y evaluación de movilidad',
    estado: 'programada',
    creadaEn: '2026-11-14T09:00:00Z',
  },
]

const DEFAULT_PACIENTES: Paciente[] = [
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
]

export function DashboardPage() {
  const role = useRole()
  const [totalPacientes, setTotalPacientes] = useState(3)
  const [totalCitasHoy, setTotalCitasHoy] = useState(2)
  const [totalEstudios, setTotalEstudios] = useState(1)
  const [totalInformes, setTotalInformes] = useState(2)
  const [totalPersonal, setTotalPersonal] = useState(3)
  const [citas, setCitas] = useState<Cita[]>(DEFAULT_CITAS)
  const [pacientes, setPacientes] = useState<Paciente[]>(DEFAULT_PACIENTES)

  useEffect(() => {
    let isMounted = true

    async function loadStats() {
      try {
        const resPac = await apiFetch<Paciente[]>('/api/v1/pacientes')
        if (isMounted && Array.isArray(resPac) && resPac.length > 0) {
          setTotalPacientes(resPac.length)
          setPacientes(resPac)
        }
      } catch {
        // Fallback
      }

      try {
        const resCitas = await apiFetch<Cita[]>('/api/v1/citas')
        if (isMounted && Array.isArray(resCitas) && resCitas.length > 0) {
          setTotalCitasHoy(resCitas.filter((c) => c.estado === 'programada').length)
          setCitas(resCitas)
        }
      } catch {
        // Fallback
      }

      try {
        const resPersonal = await apiFetch<unknown[]>('/api/v1/personal')
        if (isMounted && Array.isArray(resPersonal) && resPersonal.length > 0) {
          setTotalPersonal(resPersonal.length)
        }
      } catch {
        // Fallback
      }

      try {
        const resEstudios = await apiFetch<unknown[]>('/api/v1/estudios')
        if (isMounted && Array.isArray(resEstudios) && resEstudios.length > 0) {
          setTotalEstudios(resEstudios.length)
        }
      } catch {
        // Fallback
      }

      try {
        const resInformes = await apiFetch<unknown[]>('/api/v1/informes')
        if (isMounted && Array.isArray(resInformes) && resInformes.length > 0) {
          setTotalInformes(resInformes.length)
        }
      } catch {
        // Fallback
      }
    }

    void loadStats()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="dashboard-page">
      <DashboardMetrics
        role={role}
        totalPacientes={totalPacientes}
        totalCitasHoy={totalCitasHoy}
        totalEstudios={totalEstudios}
        totalInformes={totalInformes}
        totalPersonal={totalPersonal}
      />

      <div className="dashboard-content-split">
        <DashboardAgendaWidget citas={citas} pacientes={pacientes} />
        <DashboardQuickActions role={role} />
      </div>
    </div>
  )
}

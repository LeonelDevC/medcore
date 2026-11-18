import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card/Card'
import { useRole } from '../../hooks/useRole'
import { apiFetch } from '../../lib/api'
import type { Paciente, PacienteInput, Cita, Estudio, Informe } from '../../types'
import { PacientesList } from './components/PacientesList'
import { PacienteFicha } from './components/PacienteFicha'
import { PacienteModal } from './components/PacienteModal'
import './PacientesPage.styles.sass'

// Datos muestra iniciales clínicos si el backend está vacío o desconectado
const INITIAL_PACIENTES: Paciente[] = [
  {
    id: 'pac_01',
    nombre: 'Elena',
    apellidos: 'García Lorca',
    documento: '48291034A',
    fechaNacimiento: '1984-06-12',
    telefono: '+34 612 345 678',
    email: 'elena.garcia@ejemplo.es',
    notas: 'Paciente con dolor torácico recurrente y antecedentes de asma leve.',
    creadoEn: '2026-11-10T10:00:00Z',
  },
  {
    id: 'pac_02',
    nombre: 'Carlos',
    apellidos: 'Ruiz Zafón',
    documento: '51928374B',
    fechaNacimiento: '1976-11-23',
    telefono: '+34 654 987 321',
    email: 'carlos.ruiz@ejemplo.es',
    notas: 'Seguimiento post-operatorio de fractura de radio.',
    creadoEn: '2026-11-05T09:30:00Z',
  },
  {
    id: 'pac_03',
    nombre: 'Marina',
    apellidos: 'Vega Morales',
    documento: '09283746C',
    fechaNacimiento: '1992-03-08',
    telefono: '+34 689 112 233',
    email: 'marina.vega@ejemplo.es',
    notas: 'Control radiológico anual por escoliosis idiopática.',
    creadoEn: '2026-10-28T14:15:00Z',
  },
]

export function PacientesPage() {
  const navigate = useNavigate()
  const role = useRole()
  const [pacientes, setPacientes] = useState<Paciente[]>(INITIAL_PACIENTES)
  const [citas, setCitas] = useState<Cita[]>([])
  const [estudios, setEstudios] = useState<Estudio[]>([])
  const [informes, setInformes] = useState<Informe[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [pacienteToEdit, setPacienteToEdit] = useState<Paciente | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        const resPac = await apiFetch<Paciente[]>('/api/v1/pacientes')
        if (isMounted && Array.isArray(resPac) && resPac.length > 0) {
          setPacientes(resPac)
        }
      } catch {
        // Fallback local
      }

      try {
        const resCitas = await apiFetch<Cita[]>('/api/v1/citas')
        if (isMounted && Array.isArray(resCitas)) setCitas(resCitas)
      } catch {
        // Fallback
      }

      try {
        const resEst = await apiFetch<Estudio[]>('/api/v1/estudios')
        if (isMounted && Array.isArray(resEst)) setEstudios(resEst)
      } catch {
        // Fallback
      }

      try {
        const resInf = await apiFetch<Informe[]>('/api/v1/informes')
        if (isMounted && Array.isArray(resInf)) setInformes(resInf)
      } catch {
        // Fallback
      }
    }

    void fetchData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSavePaciente = async (input: PacienteInput) => {
    if (pacienteToEdit) {
      // Actualizar
      try {
        const updated = await apiFetch<Paciente>(`/api/v1/pacientes/${pacienteToEdit.id}`, {
          method: 'PUT',
          body: input,
        })
        setPacientes((prev) => prev.map((p) => (p.id === pacienteToEdit.id ? (updated?.id ? updated : { ...p, ...input }) : p)))
      } catch {
        setPacientes((prev) =>
          prev.map((p) => (p.id === pacienteToEdit.id ? { ...p, ...input } : p))
        )
      }
      if (selectedPaciente && selectedPaciente.id === pacienteToEdit.id) {
        setSelectedPaciente((prev) => (prev ? { ...prev, ...input } : null))
      }
    } else {
      // Crear
      const newId = `pac_${Date.now()}`
      const nuevo: Paciente = {
        id: newId,
        ...input,
        creadoEn: new Date().toISOString(),
      }
      try {
        const created = await apiFetch<Paciente>('/api/v1/pacientes', {
          method: 'POST',
          body: input,
        })
        setPacientes((prev) => [created?.id ? created : nuevo, ...prev])
      } catch {
        setPacientes((prev) => [nuevo, ...prev])
      }
    }
  }

  const handleDeletePaciente = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este paciente?')) return
    try {
      await apiFetch(`/api/v1/pacientes/${id}`, { method: 'DELETE' })
    } catch {
      // continuar eliminación local
    }
    setPacientes((prev) => prev.filter((p) => p.id !== id))
    if (selectedPaciente?.id === id) {
      setSelectedPaciente(null)
    }
  }

  return (
    <div className="pacientes-page">
      <Card>
        {selectedPaciente ? (
          <PacienteFicha
            paciente={selectedPaciente}
            citas={citas}
            estudios={estudios}
            informes={informes}
            userRole={role}
            onBack={() => setSelectedPaciente(null)}
            onEdit={() => {
              setPacienteToEdit(selectedPaciente)
              setModalOpen(true)
            }}
            onNewCita={() => {
              navigate('/citas')
            }}
          />
        ) : (
          <PacientesList
            pacientes={pacientes}
            onSelectPaciente={(p) => setSelectedPaciente(p)}
            onNewPaciente={() => {
              setPacienteToEdit(null)
              setModalOpen(true)
            }}
            onEditPaciente={(p) => {
              setPacienteToEdit(p)
              setModalOpen(true)
            }}
            onDeletePaciente={handleDeletePaciente}
          />
        )}
      </Card>

      <PacienteModal
        isOpen={modalOpen}
        paciente={pacienteToEdit}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePaciente}
      />
    </div>
  )
}

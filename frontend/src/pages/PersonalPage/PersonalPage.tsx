import { useState, useEffect } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Card } from '../../components/ui/Card/Card'
import { useRole } from '../../hooks/useRole'
import { apiFetch } from '../../lib/api'
import type { Personal, PersonalInput } from '../../types'
import { PersonalList } from './components/PersonalList'
import { PersonalModal } from './components/PersonalModal'
import './PersonalPage.styles.sass'

const INITIAL_PERSONAL: Personal[] = [
  {
    id: 'per_01',
    nombre: 'Alejandro',
    apellidos: 'Morales Gil',
    email: 'alejandro.morales@hospital.es',
    especialidad: 'Radiología y Diagnóstico por Imagen',
    rol: 'medico',
    activo: true,
    creadoEn: '2026-01-10T08:00:00Z',
  },
  {
    id: 'per_02',
    nombre: 'Beatriz',
    apellidos: 'Pérez Domínguez',
    email: 'beatriz.perez@hospital.es',
    especialidad: 'Dirección Médica y Administración',
    rol: 'admin',
    activo: true,
    creadoEn: '2026-01-05T08:00:00Z',
  },
  {
    id: 'per_03',
    nombre: 'Gonzalo',
    apellidos: 'Herrero Calvo',
    email: 'gonzalo.herrero@hospital.es',
    especialidad: 'Traumatología y Ortopedia',
    rol: 'medico',
    activo: true,
    creadoEn: '2026-02-01T09:00:00Z',
  },
]

export function PersonalPage() {
  const role = useRole()
  const [personal, setPersonal] = useState<Personal[]>(INITIAL_PERSONAL)
  const [modalOpen, setModalOpen] = useState(false)
  const [personaToEdit, setPersonaToEdit] = useState<Personal | null>(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const res = await apiFetch<Personal[]>('/api/v1/personal')
        if (isMounted && Array.isArray(res) && res.length > 0) {
          setPersonal(res)
        }
      } catch {
        // Fallback local
      }
    }

    if (role === 'admin') {
      void load()
    }

    return () => {
      isMounted = false
    }
  }, [role])

  // Restricción constitucional: solo admin tiene acceso a M5
  if (role !== 'admin') {
    return (
      <div className="personal-page">
        <Card>
          <div className="personal-denied">
            <ShieldAlert size={36} className="text-danger" />
            <h3>Acceso Restringido</h3>
            <p>
              El módulo de Gestión de Personal Médico es exclusivo para usuarios con rol de Administrador.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const handleSavePersonal = async (input: PersonalInput) => {
    if (personaToEdit) {
      // Actualizar
      try {
        const updated = await apiFetch<Personal>(`/api/v1/personal/${personaToEdit.id}`, {
          method: 'PUT',
          body: input,
        })
        setPersonal((prev) =>
          prev.map((p) => (p.id === personaToEdit.id ? (updated?.id ? updated : { ...p, ...input }) : p))
        )
      } catch {
        setPersonal((prev) =>
          prev.map((p) => (p.id === personaToEdit.id ? { ...p, ...input } : p))
        )
      }
    } else {
      // Crear
      const newId = `per_${Date.now()}`
      const nuevaPersona: Personal = {
        id: newId,
        ...input,
        creadoEn: new Date().toISOString(),
      }

      try {
        const created = await apiFetch<Personal>('/api/v1/personal', {
          method: 'POST',
          body: input,
        })
        setPersonal((prev) => [created?.id ? created : nuevaPersona, ...prev])
      } catch {
        setPersonal((prev) => [nuevaPersona, ...prev])
      }
    }
  }

  const handleToggleActivo = async (id: string, nuevoEstado: boolean) => {
    const persona = personal.find((p) => p.id === id)
    if (!persona) return

    const input: PersonalInput = {
      nombre: persona.nombre,
      apellidos: persona.apellidos,
      email: persona.email,
      especialidad: persona.especialidad,
      rol: persona.rol,
      activo: nuevoEstado,
    }

    try {
      await apiFetch<Personal>(`/api/v1/personal/${id}`, {
        method: 'PUT',
        body: input,
      })
    } catch {
      // Fallback local
    }

    setPersonal((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activo: nuevoEstado } : p))
    )
  }

  return (
    <div className="personal-page">
      <Card>
        <PersonalList
          personal={personal}
          onNewPersonal={() => {
            setPersonaToEdit(null)
            setModalOpen(true)
          }}
          onEditPersonal={(p) => {
            setPersonaToEdit(p)
            setModalOpen(true)
          }}
          onToggleActivo={handleToggleActivo}
        />
      </Card>

      <PersonalModal
        isOpen={modalOpen}
        persona={personaToEdit}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePersonal}
      />
    </div>
  )
}

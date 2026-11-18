import type { Role } from './auth'

/** M5 Personal médico */
export interface Personal {
  id: string
  nombre: string
  apellidos: string
  email: string
  especialidad: string
  rol: Role
  activo: boolean
  creadoEn: string
}

export type PersonalInput = Omit<Personal, 'id' | 'creadoEn'>

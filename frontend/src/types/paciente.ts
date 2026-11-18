/** M3 Pacientes */
export interface Paciente {
  id: string
  nombre: string
  apellidos: string
  documento: string
  fechaNacimiento: string
  telefono?: string
  email?: string
  notas?: string
  creadoEn: string
}

export type PacienteInput = Omit<Paciente, 'id' | 'creadoEn'>

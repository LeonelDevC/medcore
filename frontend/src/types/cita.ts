/** M4 Citas */
export type EstadoCita = 'programada' | 'realizada' | 'cancelada'

export interface Cita {
  id: string
  pacienteId: string
  medicoId: string
  fecha: string
  motivo: string
  estado: EstadoCita
  creadaEn: string
}

export type CitaInput = Omit<Cita, 'id' | 'creadaEn'>

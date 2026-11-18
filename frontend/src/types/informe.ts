/** M7 Informes */
export type EstadoInforme = 'borrador' | 'firmado'

export interface Adenda {
  id: string
  texto: string
  autorId: string
  creadaEn: string
}

export interface Informe {
  id: string
  pacienteId: string
  estudioId?: string
  medicoId: string
  motivo: string
  hallazgos: string
  conclusion: string
  recomendaciones: string
  estado: EstadoInforme
  creadoEn: string
  actualizadoEn: string
  firmadoEn?: string
  adendas: Adenda[]
}

export type InformeInput = {
  pacienteId: string
  estudioId?: string
  medicoId: string
  motivo: string
  hallazgos: string
  conclusion: string
  recomendaciones: string
}

export type AdendaInput = {
  texto: string
  autorId: string
}

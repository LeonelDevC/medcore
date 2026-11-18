/** M6 DICOM y Mediciones */
export type TipoMedicion = 'distancia' | 'angulo' | 'roi'

export interface Punto {
  x: number
  y: number
}

export interface Medicion {
  id: string
  tipo: TipoMedicion
  valor: number
  unidad: 'mm' | 'px' | 'grados'
  calibrada: boolean
  puntos?: Punto[]
  creadaEn: string
}

export interface Estudio {
  id: string
  pacienteId: string
  medicoId: string
  modalidad: string
  descripcion?: string
  fechaEstudio: string
  numeroCortes: number
  ancho: number
  alto: number
  pixelSpacing?: [number, number]
  storagePath?: string
  mediciones: Medicion[]
  creadoEn: string
}

export interface DicomParsedImage {
  rows: number
  columns: number
  bitsAllocated: number
  bitsStored: number
  pixelRepresentation: number // 0 = unsigned, 1 = signed
  samplesPerPixel: number
  photometricInterpretation: string
  windowCenter: number
  windowWidth: number
  rescaleSlope: number
  rescaleIntercept: number
  pixelSpacing?: [number, number]
  modality: string
  patientName?: string
  patientId?: string
  studyDate?: string
  pixelData: Int16Array | Uint16Array | Uint8Array
  minPixelValue: number
  maxPixelValue: number
}

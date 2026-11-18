import dicomParser from 'dicom-parser'
import type { DicomParsedImage } from '../../types'

/**
 * Parsea un ArrayBuffer DICOM usando dicom-parser y extrae metadatos y pixelData.
 */
export function parseDicomBuffer(buffer: ArrayBuffer): DicomParsedImage {
  const byteArray = new Uint8Array(buffer)
  const parseFn =
    dicomParser.parseDicom ||
    (dicomParser as unknown as { default?: { parseDicom?: typeof dicomParser.parseDicom } }).default?.parseDicom
  if (!parseFn) {
    throw new Error('No se encontró la función parseDicom en dicom-parser')
  }
  const dataSet = parseFn(byteArray)

  // Metadatos dimensionales
  const rows = dataSet.uint16('x00280010') ?? 512
  const columns = dataSet.uint16('x00280011') ?? 512
  const bitsAllocated = dataSet.uint16('x00280100') ?? 16
  const bitsStored = dataSet.uint16('x00280101') ?? bitsAllocated
  const pixelRepresentation = dataSet.uint16('x00280103') ?? 0 // 0 = unsigned, 1 = signed
  const samplesPerPixel = dataSet.uint16('x00280002') ?? 1
  const photometricInterpretation = dataSet.string('x00280004')?.trim() ?? 'MONOCHROME2'

  // Modalidad e identificación
  const modality = dataSet.string('x00080060')?.trim() ?? 'CR'
  const patientName = dataSet.string('x00100010')?.replace(/\^/g, ' ')?.trim() || 'ANÓNIMO'
  const patientId = dataSet.string('x00100020')?.trim() || 'ID-TEST-001'
  const studyDate = dataSet.string('x00080020')?.trim()

  // Rescale Slope y Intercept
  const rescaleSlope = parseFloat(dataSet.string('x00281053') || '1') || 1
  const rescaleIntercept = parseFloat(dataSet.string('x00281052') || '0') || 0

  // Pixel Spacing [row_spacing, col_spacing]
  let pixelSpacing: [number, number] | undefined = undefined
  const pixelSpacingStr = dataSet.string('x00280030')
  if (pixelSpacingStr) {
    const parts = pixelSpacingStr.split('\\').map((p) => parseFloat(p.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] > 0 && parts[1] > 0) {
      pixelSpacing = [parts[0], parts[1]]
    }
  }

  // Pixel Data element (7FE0, 0010)
  const pixelDataElement = dataSet.elements['x7fe00010']
  if (!pixelDataElement) {
    throw new Error('El archivo DICOM no contiene elemento de Pixel Data (7FE0,0010).')
  }

  const offset = pixelDataElement.dataOffset
  const numPixels = rows * columns

  let pixelData: Int16Array | Uint16Array | Uint8Array

  if (bitsAllocated === 16) {
    if (pixelRepresentation === 1) {
      // 16-bit signed
      pixelData = new Int16Array(buffer, offset, numPixels)
    } else {
      // 16-bit unsigned
      pixelData = new Uint16Array(buffer, offset, numPixels)
    }
  } else if (bitsAllocated === 8) {
    pixelData = new Uint8Array(buffer, offset, numPixels)
  } else {
    pixelData = new Uint16Array(buffer, offset, numPixels)
  }

  // Min / Max pixel calculation
  let minVal = Infinity
  let maxVal = -Infinity
  for (let i = 0; i < numPixels; i++) {
    const v = pixelData[i]
    if (v < minVal) minVal = v
    if (v > maxVal) maxVal = v
  }

  if (minVal === Infinity) minVal = 0
  if (maxVal === -Infinity) maxVal = 255

  // Window Center y Window Width por defecto
  let windowCenter = parseFloat(dataSet.string('x00281050') || '')
  let windowWidth = parseFloat(dataSet.string('x00281051') || '')

  if (isNaN(windowCenter) || isNaN(windowWidth) || windowWidth <= 0) {
    windowWidth = Math.max(1, maxVal - minVal)
    windowCenter = Math.round(minVal + windowWidth / 2)
  }

  return {
    rows,
    columns,
    bitsAllocated,
    bitsStored,
    pixelRepresentation,
    samplesPerPixel,
    photometricInterpretation,
    windowCenter,
    windowWidth,
    rescaleSlope,
    rescaleIntercept,
    pixelSpacing,
    modality,
    patientName,
    patientId,
    studyDate,
    pixelData,
    minPixelValue: minVal,
    maxPixelValue: maxVal,
  }
}

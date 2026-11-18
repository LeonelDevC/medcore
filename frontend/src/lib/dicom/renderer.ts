import type { DicomParsedImage } from '../../types'

/**
 * Renderiza la imagen DICOM sobre un Canvas aplicando la transformación de Ventana/Nivel.
 */
export function renderDicomToCanvas(
  canvas: HTMLCanvasElement,
  image: DicomParsedImage,
  windowCenter: number,
  windowWidth: number,
  invert: boolean = false
): void {
  const { rows, columns, pixelData, rescaleSlope, rescaleIntercept, photometricInterpretation } = image

  if (canvas.width !== columns || canvas.height !== rows) {
    canvas.width = columns
    canvas.height = rows
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const imgData = ctx.createImageData(columns, rows)
  const data = imgData.data
  const numPixels = rows * columns

  const isMonochrome1 = photometricInterpretation === 'MONOCHROME1'
  const effectiveInvert = isMonochrome1 ? !invert : invert

  const low = windowCenter - windowWidth / 2
  const high = windowCenter + windowWidth / 2
  const invWidth = 255 / Math.max(1, windowWidth)

  let pixelIdx = 0
  let dataIdx = 0

  for (let i = 0; i < numPixels; i++) {
    const rawVal = pixelData[pixelIdx++]
    const hu = rawVal * rescaleSlope + rescaleIntercept

    let gray: number
    if (hu <= low) {
      gray = 0
    } else if (hu >= high) {
      gray = 255
    } else {
      gray = Math.round((hu - low) * invWidth)
    }

    if (effectiveInvert) {
      gray = 255 - gray
    }

    data[dataIdx] = gray     // R
    data[dataIdx + 1] = gray // G
    data[dataIdx + 2] = gray // B
    data[dataIdx + 3] = 255  // Alpha
    dataIdx += 4
  }

  ctx.putImageData(imgData, 0, 0)
}

import { type RefObject, type MouseEvent, type WheelEvent } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { DicomParsedImage, Medicion } from '../../../types'

type DicomViewportProps = {
  image: DicomParsedImage | null
  loading: boolean
  error: string | null
  activeTool: 'pan' | 'distance' | 'angle'
  windowCenter: number
  windowWidth: number
  zoom: number
  measurements: Medicion[]
  viewportRef: RefObject<HTMLDivElement | null>
  imageCanvasRef: RefObject<HTMLCanvasElement | null>
  overlayCanvasRef: RefObject<HTMLCanvasElement | null>
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void
  onMouseMove: (e: MouseEvent<HTMLDivElement>) => void
  onMouseUp: () => void
  onWheel: (e: WheelEvent<HTMLDivElement>) => void
  onClick: (e: MouseEvent<HTMLDivElement>) => void
}

/**
 * Subcomponente del viewport oscuro del visor DICOM (única excepción de fondo oscuro neutro C1, R6).
 */
export function DicomViewport({
  image,
  loading,
  error,
  activeTool,
  windowCenter,
  windowWidth,
  zoom,
  measurements,
  viewportRef,
  imageCanvasRef,
  overlayCanvasRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onClick,
}: DicomViewportProps) {
  const isCalibrated = !!(image?.pixelSpacing && image.pixelSpacing.length === 2)

  return (
    <div className="dicom-page__viewport-container">
      {/* Viewport Canvas Interactivo */}
      <div
        ref={viewportRef}
        className={`dicom-page__viewport-canvas-wrapper dicom-page__viewport-canvas-wrapper--${activeTool}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
        onClick={onClick}
      >
        <canvas ref={imageCanvasRef} className="dicom-page__canvas-layer" />
        <canvas ref={overlayCanvasRef} className="dicom-page__canvas-layer" />

        {/* Estados de carga o error */}
        {loading && (
          <div className="dicom-page__loader-overlay">
            <div className="dicom-page__spinner" />
            <span>Cargando estudio DICOM...</span>
          </div>
        )}

        {error && (
          <div className="dicom-page__error-overlay">
            <AlertTriangle size={24} />
            <span>{error}</span>
          </div>
        )}

        {/* Overlays informativos clínicos (HUD) */}
        {image && !loading && (
          <>
            <div className="dicom-page__hud dicom-page__hud--tl">
              <div>
                <strong>{image.patientName || 'ANÓNIMO'}</strong> ({image.patientId || 'ID: S/N'})
              </div>
              <div>Estudio: {image.studyDate || 'N/A'}</div>
              <div>Modalidad: {image.modality}</div>
            </div>

            <div className="dicom-page__hud dicom-page__hud--tr">
              <span
                className={`dicom-page__hud-badge ${
                  isCalibrated
                    ? 'dicom-page__hud-badge--calibrated'
                    : 'dicom-page__hud-badge--uncalibrated'
                }`}
              >
                {isCalibrated ? (
                  <>
                    <CheckCircle2 size={12} />
                    <span>
                      Calibrado: {image.pixelSpacing![0]} mm/px
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={12} />
                    <span>Sin calibración (px)</span>
                  </>
                )}
              </span>
            </div>

            <div className="dicom-page__hud dicom-page__hud--bl">
              <div>
                W: {windowWidth} L: {windowCenter}
              </div>
              <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
              <div>Mediciones: {measurements.length}</div>
            </div>

            <div className="dicom-page__hud dicom-page__hud--br">
              <div>
                Modo:{' '}
                <strong>
                  {activeTool === 'pan' ? 'Navegación' : activeTool === 'distance' ? 'Regla' : 'Ángulo'}
                </strong>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

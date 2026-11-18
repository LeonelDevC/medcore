import { Move, Ruler, Sliders, Maximize2, Sun } from 'lucide-react'
import { Card } from '../../../components/ui/Card/Card'

type PresetType = 'pulmon' | 'hueso' | 'partesBlandas' | 'auto'

type DicomToolbarProps = {
  activeTool: 'pan' | 'distance' | 'angle'
  setActiveTool: (tool: 'pan' | 'distance' | 'angle') => void
  invert: boolean
  setInvert: (val: boolean | ((prev: boolean) => boolean)) => void
  windowWidth: number
  setWindowWidth: (val: number) => void
  windowCenter: number
  setWindowCenter: (val: number) => void
  onResetView: () => void
  onApplyPreset: (preset: PresetType) => void
}

/**
 * Subcomponente de barra de herramientas y controles W/L del visor DICOM.
 */
export function DicomToolbar({
  activeTool,
  setActiveTool,
  invert,
  setInvert,
  windowWidth,
  setWindowWidth,
  windowCenter,
  setWindowCenter,
  onResetView,
  onApplyPreset,
}: DicomToolbarProps) {
  return (
    <>
      {/* Herramientas interactivas */}
      <Card>
        <div className="dicom-page__panel-section">
          <h2 className="dicom-page__section-title">Herramientas</h2>
          <div className="dicom-page__tools-grid">
            <button
              type="button"
              className={`dicom-page__tool-btn ${
                activeTool === 'pan' ? 'dicom-page__tool-btn--active' : ''
              }`}
              onClick={() => setActiveTool('pan')}
              title="Desplazamiento y Zoom"
            >
              <Move size={16} />
              <span>Pan</span>
            </button>

            <button
              type="button"
              className={`dicom-page__tool-btn ${
                activeTool === 'distance' ? 'dicom-page__tool-btn--active' : ''
              }`}
              onClick={() => setActiveTool('distance')}
              title="Medición lineal"
            >
              <Ruler size={16} />
              <span>Distancia</span>
            </button>

            <button
              type="button"
              className={`dicom-page__tool-btn ${
                activeTool === 'angle' ? 'dicom-page__tool-btn--active' : ''
              }`}
              onClick={() => setActiveTool('angle')}
              title="Medición de ángulo"
            >
              <Sliders size={16} />
              <span>Ángulo</span>
            </button>

            <button
              type="button"
              className="dicom-page__tool-btn"
              onClick={onResetView}
              title="Centrar imagen"
            >
              <Maximize2 size={16} />
              <span>Centrar</span>
            </button>
          </div>

          <button
            type="button"
            className={`dicom-page__tool-btn ${invert ? 'dicom-page__tool-btn--active' : ''}`}
            onClick={() => setInvert((v) => !v)}
            style={{ width: '100%' }}
          >
            <Sun size={16} />
            <span>Invertir Grises</span>
          </button>
        </div>
      </Card>

      {/* Ventana / Nivel */}
      <Card>
        <div className="dicom-page__panel-section">
          <h2 className="dicom-page__section-title">Ventana / Nivel (W/L)</h2>
          <div className="dicom-page__presets-grid">
            <button
              type="button"
              className="dicom-page__tool-btn"
              onClick={() => onApplyPreset('pulmon')}
            >
              Pulmón
            </button>
            <button
              type="button"
              className="dicom-page__tool-btn"
              onClick={() => onApplyPreset('hueso')}
            >
              Hueso
            </button>
            <button
              type="button"
              className="dicom-page__tool-btn"
              onClick={() => onApplyPreset('partesBlandas')}
            >
              Blandas
            </button>
            <button
              type="button"
              className="dicom-page__tool-btn"
              onClick={() => onApplyPreset('auto')}
            >
              Auto
            </button>
          </div>

          <div className="dicom-page__slider-row" style={{ marginTop: 8 }}>
            <div className="dicom-page__slider-label">
              <span>Ventana (Ancho)</span>
              <span>{windowWidth}</span>
            </div>
            <input
              type="range"
              min={1}
              max={4095}
              value={windowWidth}
              onChange={(e) => setWindowWidth(Number(e.target.value))}
              className="dicom-page__slider"
            />
          </div>

          <div className="dicom-page__slider-row">
            <div className="dicom-page__slider-label">
              <span>Nivel (Centro)</span>
              <span>{windowCenter}</span>
            </div>
            <input
              type="range"
              min={-1000}
              max={3000}
              value={windowCenter}
              onChange={(e) => setWindowCenter(Number(e.target.value))}
              className="dicom-page__slider"
            />
          </div>
        </div>
      </Card>
    </>
  )
}

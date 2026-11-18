import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ChangeEvent,
  type MouseEvent,
  type WheelEvent,
} from 'react'
import { Upload } from 'lucide-react'
import { Button } from '../../components/ui/Button/Button'
import { parseDicomBuffer } from '../../lib/dicom/parser'
import { renderDicomToCanvas } from '../../lib/dicom/renderer'
import { getRole } from '../../lib/session'
import type { DicomParsedImage, Medicion, Punto } from '../../types'
import { DicomViewport } from './components/DicomViewport'
import { DicomToolbar } from './components/DicomToolbar'
import { DicomMeasurementsPanel } from './components/DicomMeasurementsPanel'
import { DicomMetadataPanel } from './components/DicomMetadataPanel'
import './DicomPage.styles.sass'

export function DicomPage() {
  const [image, setImage] = useState<DicomParsedImage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Herramientas y ventana/nivel
  const [activeTool, setActiveTool] = useState<'pan' | 'distance' | 'angle'>('pan')
  const [windowCenter, setWindowCenter] = useState<number>(1400)
  const [windowWidth, setWindowWidth] = useState<number>(2200)
  const [invert, setInvert] = useState<boolean>(false)

  // Pan & Zoom
  const [zoom, setZoom] = useState<number>(1)
  const [panOffset, setPanOffset] = useState<Punto>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Punto>({ x: 0, y: 0 })

  // Mediciones
  const [measurements, setMeasurements] = useState<Medicion[]>([])
  const [activePoints, setActivePoints] = useState<Punto[]>([])
  const [mousePos, setMousePos] = useState<Punto | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const role = getRole()

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Cargar estudio desde ArrayBuffer
  const loadDicomFromBuffer = useCallback((buffer: ArrayBuffer) => {
    try {
      setLoading(true)
      setError(null)
      const parsed = parseDicomBuffer(buffer)
      setImage(parsed)
      setWindowCenter(parsed.windowCenter)
      setWindowWidth(parsed.windowWidth)
      setMeasurements([])
      setActivePoints([])
      setZoom(1)
      setPanOffset({ x: 0, y: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo DICOM')
      setImage(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar archivo subido por usuario
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer
      if (buffer) loadDicomFromBuffer(buffer)
    }
    reader.onerror = () => {
      setError('Error al leer el archivo desde el disco')
    }
    reader.readAsArrayBuffer(file)
  }

  // Cargar muestras preconfiguradas
  const loadSample = useCallback(
    async (type: 'calibrated' | 'uncalibrated') => {
      try {
        setLoading(true)
        setError(null)
        const url = `/samples/chest_${type}.dcm`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`No se pudo cargar la muestra (${res.statusText})`)
        const buffer = await res.arrayBuffer()
        loadDicomFromBuffer(buffer)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al descargar la muestra DICOM')
      } finally {
        setLoading(false)
      }
    },
    [loadDicomFromBuffer],
  )

  // Carga automática inicial de la muestra calibrada
  useEffect(() => {
    let isMounted = true
    const initSample = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/samples/chest_calibrated.dcm')
        if (!res.ok) throw new Error(`No se pudo cargar la muestra (${res.statusText})`)
        const buffer = await res.arrayBuffer()
        if (isMounted) {
          loadDicomFromBuffer(buffer)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error al descargar la muestra DICOM')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    initSample()
    return () => {
      isMounted = false
    }
  }, [loadDicomFromBuffer])

  // Renderizar imagen médica a escala de grises
  useEffect(() => {
    if (!image || !imageCanvasRef.current) return
    const canvas = imageCanvasRef.current
    canvas.width = image.columns
    canvas.height = image.rows

    renderDicomToCanvas(canvas, image, windowCenter, windowWidth, invert)
  }, [image, windowCenter, windowWidth, invert])

  // Convertir coordenadas del ratón a coordenadas de píxel de la imagen
  const getImageCoordinates = (e: MouseEvent<HTMLDivElement>): Punto | null => {
    if (!viewportRef.current || !image) return null
    const rect = viewportRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const cx = rect.width / 2 + panOffset.x
    const cy = rect.height / 2 + panOffset.y

    const imgX = (clickX - cx) / zoom + image.columns / 2
    const imgY = (clickY - cy) / zoom + image.rows / 2

    return { x: imgX, y: imgY }
  }

  // Renderizar capa overlay de mediciones y HUD
  useEffect(() => {
    if (!overlayCanvasRef.current || !viewportRef.current || !image) return
    const canvas = overlayCanvasRef.current
    const rect = viewportRef.current.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const cx = rect.width / 2 + panOffset.x
    const cy = rect.height / 2 + panOffset.y

    const toScreen = (pt: Punto): Punto => ({
      x: (pt.x - image.columns / 2) * zoom + cx,
      y: (pt.y - image.rows / 2) * zoom + cy,
    })

    ctx.lineWidth = 1.5
    ctx.font = '12px Inter, system-ui, sans-serif'

    // 1. Dibujar mediciones completadas
    measurements.forEach((m) => {
      ctx.strokeStyle = m.calibrada ? '#34d399' : '#fbbf24'
      ctx.fillStyle = m.calibrada ? '#34d399' : '#fbbf24'

      if (m.tipo === 'distancia' && m.puntos && m.puntos.length === 2) {
        const p1 = toScreen(m.puntos[0])
        const p2 = toScreen(m.puntos[1])

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(p1.x, p1.y, 3, 0, Math.PI * 2)
        ctx.arc(p2.x, p2.y, 3, 0, Math.PI * 2)
        ctx.fill()

        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2 - 8
        const text = `${m.valor.toFixed(1)} ${m.unidad}`

        ctx.fillStyle = 'rgba(11, 18, 32, 0.85)'
        ctx.fillRect(midX - 4, midY - 12, ctx.measureText(text).width + 8, 16)
        ctx.fillStyle = m.calibrada ? '#34d399' : '#fbbf24'
        ctx.fillText(text, midX, midY)
      } else if (m.tipo === 'angulo' && m.puntos && m.puntos.length === 3) {
        const p1 = toScreen(m.puntos[0])
        const p2 = toScreen(m.puntos[1])
        const p3 = toScreen(m.puntos[2])

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.lineTo(p3.x, p3.y)
        ctx.stroke()

        const text = `${m.valor.toFixed(1)}°`
        ctx.fillStyle = 'rgba(11, 18, 32, 0.85)'
        ctx.fillRect(p2.x + 8, p2.y - 12, ctx.measureText(text).width + 8, 16)
        ctx.fillStyle = '#60a5fa'
        ctx.fillText(text, p2.x + 12, p2.y)
      }
    })

    // 2. Dibujar trazo en progreso
    if (activePoints.length > 0 && mousePos) {
      ctx.strokeStyle = '#f59e0b'
      ctx.fillStyle = '#f59e0b'

      const currentScreen = toScreen(mousePos)
      const p1 = toScreen(activePoints[0])

      if (activeTool === 'distance') {
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(currentScreen.x, currentScreen.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2)
        ctx.arc(currentScreen.x, currentScreen.y, 4, 0, Math.PI * 2)
        ctx.fill()
      } else if (activeTool === 'angle') {
        if (activePoints.length === 1) {
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(currentScreen.x, currentScreen.y)
          ctx.stroke()
        } else if (activePoints.length === 2) {
          const p2 = toScreen(activePoints[1])
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.lineTo(currentScreen.x, currentScreen.y)
          ctx.stroke()
        }
      }
    }
  }, [measurements, activePoints, mousePos, zoom, panOffset, image, activeTool])

  // Manejo de clicks en el viewport
  const handleViewportClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!image) return
    const pt = getImageCoordinates(e)
    if (!pt) return

    if (activeTool === 'distance') {
      if (activePoints.length === 0) {
        setActivePoints([pt])
      } else {
        const p1 = activePoints[0]
        const p2 = pt
        let val: number
        const isCalibrated = !!(image.pixelSpacing && image.pixelSpacing.length === 2)

        if (isCalibrated && image.pixelSpacing) {
          const dx = (p2.x - p1.x) * image.pixelSpacing[1]
          const dy = (p2.y - p1.y) * image.pixelSpacing[0]
          val = Math.hypot(dx, dy)
        } else {
          val = Math.hypot(p2.x - p1.x, p2.y - p1.y)
        }

        const newMedicion: Medicion = {
          id: `med-${Date.now()}`,
          tipo: 'distancia',
          valor: val,
          unidad: isCalibrated ? 'mm' : 'px',
          calibrada: isCalibrated,
          puntos: [p1, p2],
          creadaEn: new Date().toISOString(),
        }

        setMeasurements((prev) => [...prev, newMedicion])
        setActivePoints([])
      }
    } else if (activeTool === 'angle') {
      if (activePoints.length < 2) {
        setActivePoints((prev) => [...prev, pt])
      } else {
        const [p1, p2] = activePoints
        const p3 = pt

        const v1x = p1.x - p2.x
        const v1y = p1.y - p2.y
        const v2x = p3.x - p2.x
        const v2y = p3.y - p2.y

        const m1 = Math.hypot(v1x, v1y)
        const m2 = Math.hypot(v2x, v2y)
        let anguloGrad = 0
        if (m1 > 0 && m2 > 0) {
          const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (m1 * m2)))
          anguloGrad = (Math.acos(cos) * 180) / Math.PI
        }

        const newMedicion: Medicion = {
          id: `med-${Date.now()}`,
          tipo: 'angulo',
          valor: anguloGrad,
          unidad: 'grados',
          calibrada: true,
          puntos: [p1, p2, p3],
          creadaEn: new Date().toISOString(),
        }

        setMeasurements((prev) => [...prev, newMedicion])
        setActivePoints([])
      }
    }
  }

  // Interacción Pan & Zoom
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'pan' || e.button === 1 || e.shiftKey) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const pt = getImageCoordinates(e)
    setMousePos(pt)

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87
    setZoom((prev) => Math.max(0.3, Math.min(8, prev * zoomFactor)))
  }

  // Presets W/L
  const applyPreset = (preset: 'pulmon' | 'hueso' | 'partesBlandas' | 'auto') => {
    if (!image) return
    switch (preset) {
      case 'pulmon':
        setWindowWidth(1500)
        setWindowCenter(-600)
        break
      case 'hueso':
        setWindowWidth(2000)
        setWindowCenter(400)
        break
      case 'partesBlandas':
        setWindowWidth(400)
        setWindowCenter(50)
        break
      case 'auto':
        setWindowWidth(Math.max(1, image.maxPixelValue - image.minPixelValue))
        setWindowCenter(
          Math.round(image.minPixelValue + (image.maxPixelValue - image.minPixelValue) / 2),
        )
        break
    }
  }

  const resetView = () => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const deleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id))
  }

  const handleSaveToBackend = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="dicom-page">
      {/* Cabecera */}
      <div className="dicom-page__header">
        <div className="dicom-page__title-group">
          <h1 className="dicom-page__title">Visor DICOM</h1>
          <p className="dicom-page__subtitle">
            Carga manual de estudios clínicos, ajuste de ventana/nivel y mediciones calibradas (M6).
          </p>
        </div>

        {/* Acciones de carga de estudio */}
        <div className="dicom-page__actions">
          <label className="dicom-page__upload-label">
            <input
              type="file"
              accept=".dcm,application/dicom"
              onChange={handleFileUpload}
              className="dicom-page__file-input"
            />
            <span className="button button--secondary button--sm">
              <Upload size={15} />
              <span>Cargar .dcm</span>
            </span>
          </label>

          <Button variant="ghost" size="sm" onClick={() => loadSample('calibrated')}>
            Muestra calibrada (mm)
          </Button>

          <Button variant="ghost" size="sm" onClick={() => loadSample('uncalibrated')}>
            Muestra sin calibración (px)
          </Button>
        </div>
      </div>

      {/* Área de trabajo */}
      <div className="dicom-page__workspace">
        <DicomViewport
          image={image}
          loading={loading}
          error={error}
          activeTool={activeTool}
          windowCenter={windowCenter}
          windowWidth={windowWidth}
          zoom={zoom}
          measurements={measurements}
          viewportRef={viewportRef}
          imageCanvasRef={imageCanvasRef}
          overlayCanvasRef={overlayCanvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleViewportClick}
        />

        {/* Barra lateral de herramientas y mediciones */}
        <div className="dicom-page__sidebar">
          <DicomToolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            invert={invert}
            setInvert={setInvert}
            windowWidth={windowWidth}
            setWindowWidth={setWindowWidth}
            windowCenter={windowCenter}
            setWindowCenter={setWindowCenter}
            onResetView={resetView}
            onApplyPreset={applyPreset}
          />

          <DicomMeasurementsPanel
            measurements={measurements}
            role={role}
            saveSuccess={saveSuccess}
            onDeleteMeasurement={deleteMeasurement}
            onSaveToBackend={handleSaveToBackend}
          />

          <DicomMetadataPanel image={image} />
        </div>
      </div>
    </div>
  )
}

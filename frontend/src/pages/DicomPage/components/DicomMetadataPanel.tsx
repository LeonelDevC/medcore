import { Card } from '../../../components/ui/Card/Card'
import type { DicomParsedImage } from '../../../types'

type DicomMetadataPanelProps = {
  image: DicomParsedImage | null
}

/**
 * Subcomponente para desplegar los metadatos técnicos extraídos de la cabecera DICOM.
 */
export function DicomMetadataPanel({ image }: DicomMetadataPanelProps) {
  if (!image) return null

  return (
    <Card>
      <div className="dicom-page__panel-section">
        <h2 className="dicom-page__section-title">Metadatos DICOM</h2>
        <table className="dicom-page__metadata-table">
          <tbody>
            <tr>
              <td>Modalidad</td>
              <td>{image.modality}</td>
            </tr>
            <tr>
              <td>Dimensiones</td>
              <td>
                {image.columns} × {image.rows}
              </td>
            </tr>
            <tr>
              <td>Bits / Muestra</td>
              <td>
                {image.bitsAllocated}b ({image.bitsStored}b almac.)
              </td>
            </tr>
            <tr>
              <td>Pixel Spacing</td>
              <td>
                {image.pixelSpacing
                  ? `${image.pixelSpacing[0]} × ${image.pixelSpacing[1]} mm`
                  : 'No definido'}
              </td>
            </tr>
            <tr>
              <td>Rango Raw</td>
              <td>
                [{image.minPixelValue}, {image.maxPixelValue}]
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  )
}

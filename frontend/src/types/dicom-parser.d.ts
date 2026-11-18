declare module 'dicom-parser' {
  export interface Element {
    tag: string
    vr?: string
    length: number
    dataOffset: number
  }

  export interface DataSet {
    elements: Record<string, Element>
    byteArray: Uint8Array
    string(tag: string, index?: number): string | undefined
    int16(tag: string, index?: number): number | undefined
    uint16(tag: string, index?: number): number | undefined
    int32(tag: string, index?: number): number | undefined
    uint32(tag: string, index?: number): number | undefined
    float(tag: string, index?: number): number | undefined
    double(tag: string, index?: number): number | undefined
    numStringValues(tag: string): number
  }

  export function parseDicom(byteArray: Uint8Array, options?: { untilTag?: string }): DataSet

  const dicomParser: {
    parseDicom(byteArray: Uint8Array, options?: { untilTag?: string }): DataSet
  }

  export default dicomParser
}

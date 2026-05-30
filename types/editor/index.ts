export type FieldDefinition = {
  key: string
  label: string
  category: string
  kind: string
  defaultText: string
  defaultWidthMm: number
  defaultHeightMm: number
}

export type TextStyle = {
  fontSize: number
  bold: boolean
  italic: boolean
  underline: boolean
  reverse: boolean
  textAlign: 'left' | 'center' | 'right'
  verticalAlign: 'top' | 'middle' | 'bottom'
  letterSpacing: number
  lineHeight: number
  autoWrap: boolean
  equalSpacing: boolean
  border: boolean
}

export type CanvasElement = {
  id: string
  fieldKey: string
  fieldLabel: string
  instanceNo: number
  displayName: string
  printOrder: number
  xMm: number
  yMm: number
  widthMm: number
  heightMm: number
  angle: number
  text: string
  style: TextStyle
}

export type LabelCanvasConfig = {
  widthMm: number
  heightMm: number
  pxPerMm: number
}

import type {
  CanvasElement,
  LabelCanvasConfig,
  TextStyle,
} from '@/types/editor'

export type LabelDesignJson = {
  canvasConfig: LabelCanvasConfig
  elements: CanvasElement[]
}

export const createLabelDesignJson = (
  canvasConfig: LabelCanvasConfig,
  elements: CanvasElement[],
): LabelDesignJson => ({
  canvasConfig,
  elements: elements.map((element) => ({
    id: element.id,
    fieldKey: element.fieldKey,
    fieldLabel: element.fieldLabel,
    instanceNo: element.instanceNo,
    displayName: element.displayName,
    printOrder: element.printOrder,
    xMm: element.xMm,
    yMm: element.yMm,
    widthMm: element.widthMm,
    heightMm: element.heightMm,
    angle: element.angle,
    text: element.text,
    style: element.style,
  })),
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isCanvasConfig = (value: unknown): value is LabelCanvasConfig =>
  isRecord(value) &&
  typeof value.widthMm === 'number' &&
  typeof value.heightMm === 'number' &&
  typeof value.pxPerMm === 'number'

const isTextAlign = (value: unknown): value is TextStyle['textAlign'] =>
  value === 'left' || value === 'center' || value === 'right'

const isVerticalAlign = (
  value: unknown,
): value is TextStyle['verticalAlign'] =>
  value === 'top' || value === 'middle' || value === 'bottom'

const isTextStyle = (value: unknown): value is TextStyle =>
  isRecord(value) &&
  typeof value.fontSize === 'number' &&
  typeof value.bold === 'boolean' &&
  typeof value.italic === 'boolean' &&
  typeof value.underline === 'boolean' &&
  typeof value.reverse === 'boolean' &&
  isTextAlign(value.textAlign) &&
  isVerticalAlign(value.verticalAlign) &&
  typeof value.letterSpacing === 'number' &&
  typeof value.lineHeight === 'number' &&
  typeof value.autoWrap === 'boolean' &&
  typeof value.equalSpacing === 'boolean' &&
  typeof value.border === 'boolean'

const isCanvasElement = (value: unknown): value is CanvasElement =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.fieldKey === 'string' &&
  typeof value.fieldLabel === 'string' &&
  typeof value.instanceNo === 'number' &&
  typeof value.displayName === 'string' &&
  typeof value.printOrder === 'number' &&
  typeof value.xMm === 'number' &&
  typeof value.yMm === 'number' &&
  typeof value.widthMm === 'number' &&
  typeof value.heightMm === 'number' &&
  typeof value.angle === 'number' &&
  typeof value.text === 'string' &&
  isTextStyle(value.style)

export const isLabelDesignJson = (
  value: unknown,
): value is LabelDesignJson =>
  isRecord(value) &&
  isCanvasConfig(value.canvasConfig) &&
  Array.isArray(value.elements) &&
  value.elements.every(isCanvasElement)

export const getLabelDesignJsonValidationError = (
  value: unknown,
): string | null => {
  if (!isRecord(value)) {
    return 'JSON形式が正しくありません'
  }

  if (!Array.isArray(value.elements)) {
    return 'JSONにelementsがありません'
  }

  if (!isCanvasConfig(value.canvasConfig)) {
    return 'JSONのcanvas config形式が正しくありません'
  }

  if (!value.elements.every(isCanvasElement)) {
    return 'JSONのelements形式が正しくありません'
  }

  return null
}

import type { LabelCanvasConfig } from '@/types/editor'

export const getCanvasWidthPx = (canvasConfig: LabelCanvasConfig) =>
  canvasConfig.widthMm * canvasConfig.pxPerMm

export const getCanvasHeightPx = (canvasConfig: LabelCanvasConfig) =>
  canvasConfig.heightMm * canvasConfig.pxPerMm

export const mmToPx = (valueMm: number, canvasConfig: LabelCanvasConfig) =>
  valueMm * canvasConfig.pxPerMm

export const pxToMm = (valuePx: number, canvasConfig: LabelCanvasConfig) =>
  Number((valuePx / canvasConfig.pxPerMm).toFixed(2))

import {
  Group,
  Rect,
  Textbox,
  Text,
  type Canvas as FabricCanvasInstance,
} from 'fabric'

import type { FabricGroupWithElementId } from '@/components/editor/fabric/types'
import { mmToPx, pxToMm } from '@/components/editor/fabric/units'
import type { CanvasElement, LabelCanvasConfig } from '@/types/editor'

export const ELEMENT_PADDING_PX = 4

const DEFAULT_RECT_FILL = '#ffffff'
const DEFAULT_RECT_STROKE = '#cbd5e1'
const SELECTED_RECT_STROKE = '#06b6d4'
const TEXT_FILL = '#111827'
const LABEL_FILL = '#64748b'
const LABEL_FONT_SIZE = 10
const BADGE_FILL = '#ffffff'
const BADGE_BACKGROUND = '#ef4444'
const BADGE_FONT_SIZE = 12
const BADGE_OFFSET_PX = 2

export const getElementIdFromFabricObject = (object: unknown) => {
  if (object instanceof Group && 'elementId' in object) {
    return object.elementId as string
  }

  return null
}

const getTextboxTop = (
  textbox: Textbox,
  heightPx: number,
  verticalAlign: CanvasElement['style']['verticalAlign'],
) => {
  textbox.initDimensions()

  const textHeight = textbox.height ?? 0
  const minTop = -heightPx / 2 + ELEMENT_PADDING_PX
  const maxTop = heightPx / 2 - ELEMENT_PADDING_PX - textHeight

  if (textHeight > heightPx - ELEMENT_PADDING_PX * 2) {
    return minTop
  }

  if (verticalAlign === 'middle') {
    return (minTop + maxTop) / 2
  }

  if (verticalAlign === 'bottom') {
    return maxTop
  }

  return minTop
}

export const syncGroupToElementSize = (
  group: FabricGroupWithElementId,
  widthPx: number,
  heightPx: number,
) => {
  // const [rect, textbox] = group.getObjects()
  const [rect, textbox, label, badge] = group.getObjects()
  const left = -widthPx / 2
  const top = -heightPx / 2
  const rectStrokeWidth = rect?.strokeWidth ?? 0
  const rectStrokeOffset = rectStrokeWidth / 2

  rect?.set({
    left: left + rectStrokeOffset,
    top: top + rectStrokeOffset,
    width: Math.max(widthPx - rectStrokeWidth, 0),
    height: Math.max(heightPx - rectStrokeWidth, 0),
    scaleX: 1,
    scaleY: 1,
  })

  textbox?.set({
    left: left + ELEMENT_PADDING_PX,
    width: Math.max(widthPx - ELEMENT_PADDING_PX * 2, 0),
    scaleX: 1,
    scaleY: 1,
  })

  if (textbox instanceof Textbox) {
    textbox.set({
      top: getTextboxTop(textbox, heightPx, group.verticalAlign),
    })
  }
  label?.set({
    left: left + ELEMENT_PADDING_PX,
    top: top + 2,
    scaleX: 1,
    scaleY: 1,
  })

  badge?.set({
    left: widthPx / 2 - BADGE_OFFSET_PX,
    top: heightPx / 2 - BADGE_OFFSET_PX,
    scaleX: 1,
    scaleY: 1,
  })
}

export const updateGroupSelectionStyle = (
  group: FabricGroupWithElementId,
  isSelected: boolean,
) => {
  const [rect] = group.getObjects()

  rect?.set({
    stroke: group.borderEnabled
      ? isSelected
        ? SELECTED_RECT_STROKE
        : DEFAULT_RECT_STROKE
      : '',
    strokeWidth: group.borderEnabled ? 1 : 0,
  })
}

const resizeElementGroup = (group: FabricGroupWithElementId) => {
  const actualWidthPx = (group.width ?? 0) * (group.scaleX ?? 1)
  const actualHeightPx = (group.height ?? 0) * (group.scaleY ?? 1)

  syncGroupToElementSize(group, actualWidthPx, actualHeightPx)

  group.set({
    width: actualWidthPx,
    height: actualHeightPx,
    scaleX: 1,
    scaleY: 1,
  })
  group.setCoords()

  return {
    widthPx: actualWidthPx,
    heightPx: actualHeightPx,
  }
}

export const syncPositionFromGroup = (
  group: FabricGroupWithElementId,
  canvasConfig: LabelCanvasConfig,
) => ({
  xMm: pxToMm(group.left ?? 0, canvasConfig),
  yMm: pxToMm(group.top ?? 0, canvasConfig),
})

export const syncSizeFromGroup = (
  group: FabricGroupWithElementId,
  canvasConfig: LabelCanvasConfig,
) => {
  const { widthPx, heightPx } = resizeElementGroup(group)

  return {
    widthMm: pxToMm(widthPx, canvasConfig),
    heightMm: pxToMm(heightPx, canvasConfig),
  }
}

export const syncAngleFromGroup = (group: FabricGroupWithElementId) => ({
  angle: Math.round(group.angle ?? 0),
})

export const hasGroupScaleChanged = (group: FabricGroupWithElementId) =>
  Math.abs((group.scaleX ?? 1) - 1) > 0.001 ||
  Math.abs((group.scaleY ?? 1) - 1) > 0.001

export const createElementGroup = (
  element: CanvasElement,
  canvasConfig: LabelCanvasConfig,
) => {
  const rectWidthPx = mmToPx(element.widthMm, canvasConfig)
  const rectHeightPx = mmToPx(element.heightMm, canvasConfig)
  const textWidthPx = Math.max(rectWidthPx - ELEMENT_PADDING_PX * 2, 0)

  const rect = new Rect({
    left: 0,
    top: 0,
    originX: 'left',
    originY: 'top',
    width: rectWidthPx,
    height: rectHeightPx,
    fill: DEFAULT_RECT_FILL,
    stroke: element.style.border ? DEFAULT_RECT_STROKE : '',
    strokeWidth: element.style.border ? 1 : 0,
    selectable: false,
    evented: false,
  })

  const textbox = new Textbox(element.text, {
    left: ELEMENT_PADDING_PX,
    top: ELEMENT_PADDING_PX,
    originX: 'left',
    originY: 'top',
    width: textWidthPx,
    fontSize: element.style.fontSize,
    fontWeight: element.style.bold ? 'bold' : 'normal',
    fontStyle: element.style.italic ? 'italic' : 'normal',
    underline: element.style.underline,
    textAlign: element.style.textAlign,
    fill: TEXT_FILL,
    backgroundColor: '',
    lineHeight: element.style.lineHeight,
    charSpacing: element.style.letterSpacing,
    splitByGrapheme: element.style.autoWrap,
    selectable: false,
    evented: false,
  })

  // label 和 badge 是编辑辅助信息
  const label = new Text(element.displayName, {
    left: ELEMENT_PADDING_PX,
    top: 2,
    originX: 'left',
    originY: 'top',
    fontSize: LABEL_FONT_SIZE,
    fill: LABEL_FILL,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  })

  const badge = new Text(String(element.printOrder), {
    left: rectWidthPx - BADGE_OFFSET_PX,
    top: rectHeightPx - BADGE_OFFSET_PX,
    originX: 'right',
    originY: 'bottom',
    fontSize: BADGE_FONT_SIZE,
    fill: BADGE_FILL,
    backgroundColor: BADGE_BACKGROUND,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  })

  const group = new Group([rect, textbox, label, badge], {
    left: mmToPx(element.xMm, canvasConfig),
    top: mmToPx(element.yMm, canvasConfig),
    originX: 'left',
    originY: 'top',
    width: rectWidthPx,
    height: rectHeightPx,
    angle: element.angle,
  }) as FabricGroupWithElementId

  group.elementId = element.id
  group.borderEnabled = element.style.border
  group.verticalAlign = element.style.verticalAlign
  syncGroupToElementSize(group, rectWidthPx, rectHeightPx)

  return group
}

export const updateElementGroup = (
  group: FabricGroupWithElementId,
  element: CanvasElement,
  canvasConfig: LabelCanvasConfig,
) => {
  const widthPx = mmToPx(element.widthMm, canvasConfig)
  const heightPx = mmToPx(element.heightMm, canvasConfig)
  // const [rect, textbox] = group.getObjects()
  const [rect, textbox, label, badge] = group.getObjects()

  group.borderEnabled = element.style.border
  group.verticalAlign = element.style.verticalAlign
  rect?.set({
    stroke: element.style.border ? DEFAULT_RECT_STROKE : '',
    strokeWidth: element.style.border ? 1 : 0,
  })
  textbox?.set({
    text: element.text,
    fontSize: element.style.fontSize,
    fontWeight: element.style.bold ? 'bold' : 'normal',
    fontStyle: element.style.italic ? 'italic' : 'normal',
    underline: element.style.underline,
    textAlign: element.style.textAlign,
    fill: TEXT_FILL,
    backgroundColor: '',
    lineHeight: element.style.lineHeight,
    charSpacing: element.style.letterSpacing,
    splitByGrapheme: element.style.autoWrap,
  })
  label?.set({
    text: element.displayName,
  })
  badge?.set({
    text: String(element.printOrder),
  })
  syncGroupToElementSize(group, widthPx, heightPx)

  group.set({
    left: mmToPx(element.xMm, canvasConfig),
    top: mmToPx(element.yMm, canvasConfig),
    width: widthPx,
    height: heightPx,
    angle: element.angle,
    scaleX: 1,
    scaleY: 1,
  })
  group.setCoords()
}

export const findGroupByElementId = (
  fabricCanvas: FabricCanvasInstance,
  elementId: string,
) =>
  fabricCanvas
    .getObjects()
    .find(
      (object): object is FabricGroupWithElementId =>
        object instanceof Group &&
        'elementId' in object &&
        object.elementId === elementId,
    )

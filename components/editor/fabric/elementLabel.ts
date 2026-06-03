import { Text, type Canvas as FabricCanvasInstance } from 'fabric'

import type { FabricLabelWithElementId } from '@/components/editor/fabric/types'
import { mmToPx } from '@/components/editor/fabric/units'
import type { CanvasElement, LabelCanvasConfig } from '@/types/editor'

const LABEL_FILL = '#64748b'
const LABEL_FONT_SIZE = 14
const LABEL_OFFSET_Y = 14

export const getLabelElementIdFromFabricObject = (object: unknown) => {
  if (object instanceof Text && 'labelForElementId' in object) {
    return object.labelForElementId as string
  }

  return null
}

export const createElementLabel = (
  element: CanvasElement,
  canvasConfig: LabelCanvasConfig,
) => {
  const label = new Text(element.displayName, {
    left: mmToPx(element.xMm, canvasConfig),
    top: Math.max(mmToPx(element.yMm, canvasConfig) - LABEL_OFFSET_Y, 0),
    fontSize: LABEL_FONT_SIZE,
    fill: LABEL_FILL,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  }) as FabricLabelWithElementId

  label.labelForElementId = element.id

  return label
}

export const updateElementLabel = (
  label: FabricLabelWithElementId,
  element: CanvasElement,
  canvasConfig: LabelCanvasConfig,
) => {
  label.set({
    text: element.displayName,
    left: mmToPx(element.xMm, canvasConfig),
    top: Math.max(mmToPx(element.yMm, canvasConfig) - LABEL_OFFSET_Y, 0),
  })
  label.setCoords()
}

export const findLabelByElementId = (
  fabricCanvas: FabricCanvasInstance,
  elementId: string,
) =>
  fabricCanvas
    .getObjects()
    .find(
      (object): object is FabricLabelWithElementId =>
        object instanceof Text &&
        'labelForElementId' in object &&
        object.labelForElementId === elementId,
    )

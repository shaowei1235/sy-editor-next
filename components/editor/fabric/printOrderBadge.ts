import { Text, type Canvas as FabricCanvasInstance } from 'fabric'

import type { FabricPrintOrderWithElementId } from '@/components/editor/fabric/types'
import { mmToPx } from '@/components/editor/fabric/units'
import type { CanvasElement, LabelCanvasConfig } from '@/types/editor'

const PRINT_ORDER_FILL = '#ffffff'
const PRINT_ORDER_BACKGROUND = '#ef4444'
const PRINT_ORDER_FONT_SIZE = 16

const getPrintOrderPosition = (
  element: CanvasElement,
  canvasConfig: LabelCanvasConfig,
) => ({
  left: mmToPx(element.xMm + element.widthMm, canvasConfig),
  top: mmToPx(element.yMm + element.heightMm, canvasConfig),
})

export const getPrintOrderElementIdFromFabricObject = (object: unknown) => {
  if (object instanceof Text && 'printOrderForElementId' in object) {
    return object.printOrderForElementId as string
  }

  return null
}

export const createElementPrintOrder = (
  element: CanvasElement,
  canvasConfig: LabelCanvasConfig,
) => {
  const printOrderPosition = getPrintOrderPosition(element, canvasConfig)
  const printOrder = new Text(String(element.printOrder), {
    ...printOrderPosition,
    originX: 'right',
    originY: 'bottom',
    fontSize: PRINT_ORDER_FONT_SIZE,
    fill: PRINT_ORDER_FILL,
    backgroundColor: PRINT_ORDER_BACKGROUND,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  }) as FabricPrintOrderWithElementId

  printOrder.printOrderForElementId = element.id

  return printOrder
}

export const updateElementPrintOrder = (
  printOrder: FabricPrintOrderWithElementId,
  element: CanvasElement,
  canvasConfig: LabelCanvasConfig,
) => {
  printOrder.set({
    text: String(element.printOrder),
    ...getPrintOrderPosition(element, canvasConfig),
  })
  printOrder.setCoords()
}

export const findPrintOrderByElementId = (
  fabricCanvas: FabricCanvasInstance,
  elementId: string,
) =>
  fabricCanvas
    .getObjects()
    .find(
      (object): object is FabricPrintOrderWithElementId =>
        object instanceof Text &&
        'printOrderForElementId' in object &&
        object.printOrderForElementId === elementId,
    )

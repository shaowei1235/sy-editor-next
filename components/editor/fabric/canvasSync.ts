import type { Canvas as FabricCanvasInstance } from 'fabric'

import {
  createElementGroup,
  findGroupByElementId,
  getElementIdFromFabricObject,
  updateElementGroup,
  updateGroupSelectionStyle,
} from '@/components/editor/fabric/elementGroup'
import {
  createElementLabel,
  findLabelByElementId,
  getLabelElementIdFromFabricObject,
  updateElementLabel,
} from '@/components/editor/fabric/elementLabel'
import {
  createElementPrintOrder,
  findPrintOrderByElementId,
  getPrintOrderElementIdFromFabricObject,
  updateElementPrintOrder,
} from '@/components/editor/fabric/printOrderBadge'
import type { FabricGroupWithElementId } from '@/components/editor/fabric/types'
import type { CanvasElement, LabelCanvasConfig } from '@/types/editor'

type SyncCanvasObjectsOptions = {
  fabricCanvas: FabricCanvasInstance
  elements: CanvasElement[]
  canvasConfig: LabelCanvasConfig
}

type SyncCanvasSelectionOptions = {
  fabricCanvas: FabricCanvasInstance
  selectedElementId: string | null
}

export const syncCanvasObjectsToElements = ({
  fabricCanvas,
  elements,
  canvasConfig,
}: SyncCanvasObjectsOptions) => {
  const elementIds = new Set(elements.map((element) => element.id))

  fabricCanvas.getObjects().forEach((object) => {
    const elementId = getElementIdFromFabricObject(object)
    const labelElementId = getLabelElementIdFromFabricObject(object)
    const printOrderElementId = getPrintOrderElementIdFromFabricObject(object)

    if (elementId && !elementIds.has(elementId)) {
      fabricCanvas.remove(object)
    }

    if (labelElementId && !elementIds.has(labelElementId)) {
      fabricCanvas.remove(object)
    }

    if (printOrderElementId && !elementIds.has(printOrderElementId)) {
      fabricCanvas.remove(object)
    }
  })

  elements.forEach((element) => {
    const existingGroup = findGroupByElementId(fabricCanvas, element.id)

    if (existingGroup) {
      updateElementGroup(existingGroup, element, canvasConfig)
    } else {
      fabricCanvas.add(createElementGroup(element, canvasConfig))
    }

    const existingLabel = findLabelByElementId(fabricCanvas, element.id)

    if (existingLabel) {
      updateElementLabel(existingLabel, element, canvasConfig)
    } else {
      fabricCanvas.add(createElementLabel(element, canvasConfig))
    }

    const existingPrintOrder = findPrintOrderByElementId(
      fabricCanvas,
      element.id,
    )

    if (existingPrintOrder) {
      updateElementPrintOrder(existingPrintOrder, element, canvasConfig)
      return
    }

    fabricCanvas.add(createElementPrintOrder(element, canvasConfig))
  })
}

export const syncCanvasSelectionToElement = ({
  fabricCanvas,
  selectedElementId,
}: SyncCanvasSelectionOptions) => {
  fabricCanvas.getObjects().forEach((object) => {
    const elementId = getElementIdFromFabricObject(object)

    if (elementId) {
      updateGroupSelectionStyle(
        object as FabricGroupWithElementId,
        elementId === selectedElementId,
      )
    }
  })

  if (!selectedElementId) {
    fabricCanvas.discardActiveObject()
    return
  }

  const targetObject = findGroupByElementId(fabricCanvas, selectedElementId)

  if (!targetObject) {
    fabricCanvas.discardActiveObject()
    return
  }

  if (fabricCanvas.getActiveObject() !== targetObject) {
    fabricCanvas.setActiveObject(targetObject)
  }
}

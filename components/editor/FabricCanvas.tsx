'use client'

import {
  Canvas as FabricCanvasInstance,
  Group,
  Rect,
  Textbox,
  Text,
} from 'fabric'
import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/lib/editor/store'

import type { LabelCanvasConfig, CanvasElement } from '@/types/editor'
type FabricGroupWithElementId = Group & {
  elementId: string
}
type FabricLabelWithElementId = Text & {
  labelForElementId: string
}

const ELEMENT_PADDING_PX = 4
const DEFAULT_RECT_FILL = '#ffffff'
const DEFAULT_RECT_STROKE = '#cbd5e1'
const SELECTED_RECT_STROKE = '#06b6d4'
const TEXT_FILL = '#111827'
const LABEL_FILL = '#64748b'
const LABEL_FONT_SIZE = 10
const LABEL_OFFSET_Y = 14

const getElementIdFromFabricObject = (object: unknown) => {
  if (object instanceof Group && 'elementId' in object) {
    return object.elementId as string
  }

  return null
}

const getLabelElementIdFromFabricObject = (object: unknown) => {
  if (object instanceof Text && 'labelForElementId' in object) {
    return object.labelForElementId as string
  }

  return null
}

const syncGroupToElementSize = (
  group: FabricGroupWithElementId,
  widthPx: number,
  heightPx: number,
) => {
  const [rect, textbox] = group.getObjects()
  // 父盒子中心点的相对坐标
  const left = -widthPx / 2
  const top = -heightPx / 2

  rect?.set({
    left,
    top,
    width: widthPx,
    height: heightPx,
    scaleX: 1,
    scaleY: 1,
  })

  textbox?.set({
    left: left + ELEMENT_PADDING_PX,
    top: top + ELEMENT_PADDING_PX,
    width: Math.max(widthPx - ELEMENT_PADDING_PX * 2, 0),
    scaleX: 1,
    scaleY: 1,
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

const CANVAS_CONFIG: LabelCanvasConfig = {
  widthMm: 60,
  heightMm: 40,
  pxPerMm: 8,
}

const canvasWidthPx = CANVAS_CONFIG.widthMm * CANVAS_CONFIG.pxPerMm
const canvasHeightPx = CANVAS_CONFIG.heightMm * CANVAS_CONFIG.pxPerMm
const mmToPx = (valueMm: number) => valueMm * CANVAS_CONFIG.pxPerMm
const pxToMm = (valuePx: number) =>
  Number((valuePx / CANVAS_CONFIG.pxPerMm).toFixed(2))

const syncPositionFromGroup = (group: FabricGroupWithElementId) => ({
  xMm: pxToMm(group.left ?? 0),
  yMm: pxToMm(group.top ?? 0),
})

const syncSizeFromGroup = (group: FabricGroupWithElementId) => {
  const { widthPx, heightPx } = resizeElementGroup(group)
  return {
    widthMm: pxToMm(widthPx),
    heightMm: pxToMm(heightPx),
  }
}

const syncAngleFromGroup = (group: FabricGroupWithElementId) => ({
  angle: Math.round(group.angle ?? 0),
})

// 当前修改是否包含缩放
// syncSizeFromGroup()--->resizeElementGroup()导致旋转失效
const hasGroupScaleChanged = (group: FabricGroupWithElementId) =>
  Math.abs((group.scaleX ?? 1) - 1) > 0.01 ||
  Math.abs((group.scaleY ?? 1) - 1) > 0.01

const createElementGroup = (element: CanvasElement) => {
  const rectWidthPx = mmToPx(element.widthMm)
  const rectHeightPx = mmToPx(element.heightMm)
  const textWidthPx = Math.max(rectWidthPx - ELEMENT_PADDING_PX * 2, 0)

  const rect = new Rect({
    left: 0,
    top: 0,
    originX: 'left',
    originY: 'top',
    width: rectWidthPx,
    height: rectHeightPx,
    fill: DEFAULT_RECT_FILL,
    stroke: DEFAULT_RECT_STROKE,
    strokeWidth: 1,
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

  const group = new Group([rect, textbox], {
    left: mmToPx(element.xMm),
    top: mmToPx(element.yMm),
    originX: 'left',
    originY: 'top',
    width: rectWidthPx,
    height: rectHeightPx,
    angle: element.angle,
  }) as FabricGroupWithElementId

  group.elementId = element.id

  return group
}

const updateElementGroup = (
  group: FabricGroupWithElementId,
  element: CanvasElement,
) => {
  const widthPx = mmToPx(element.widthMm)
  const heightPx = mmToPx(element.heightMm)
  const [, textbox] = group.getObjects()

  syncGroupToElementSize(group, widthPx, heightPx)
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

  group.set({
    left: mmToPx(element.xMm),
    top: mmToPx(element.yMm),
    width: widthPx,
    height: heightPx,
    angle: element.angle,
    scaleX: 1,
    scaleY: 1,
  })
  group.setCoords()
}

const findGroupByElementId = (
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
const updateGroupSelectionStyle = (
  group: FabricGroupWithElementId,
  isSelected: boolean,
) => {
  const [rect] = group.getObjects()
  rect?.set({
    stroke: isSelected ? SELECTED_RECT_STROKE : DEFAULT_RECT_STROKE,
  })
}

const createElementLabel = (element: CanvasElement) => {
  const label = new Text(element.displayName, {
    left: mmToPx(element.xMm),
    top: Math.max(mmToPx(element.yMm) - LABEL_OFFSET_Y, 0),
    fontSize: LABEL_FONT_SIZE,
    fill: LABEL_FILL,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  }) as FabricLabelWithElementId
  label.labelForElementId = element.id
  return label
}

const updateElementLabel = (
  label: FabricLabelWithElementId,
  element: CanvasElement,
) => {
  label.set({
    text: element.displayName,
    left: mmToPx(element.xMm),
    top: Math.max(mmToPx(element.yMm) - LABEL_OFFSET_Y, 0),
  })
  label.setCoords()
}

const findLabelByElementId = (
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

export function FabricCanvas() {
  const elements = useEditorStore((state) => state.elements)
  const selectedElementId = useEditorStore((state) => state.selectedElementId)
  const selectElement = useEditorStore((state) => state.selectElement)
  const updateElement = useEditorStore((state) => state.updateElement)

  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  const fabricCanvasRef = useRef<FabricCanvasInstance | null>(null)

  const isSyncintSelectionRef = useRef(false)

  // 容器初始化
  useEffect(() => {
    if (!canvasElementRef.current) {
      return
    }
    const fabricCanvas = new FabricCanvasInstance(canvasElementRef.current, {
      width: canvasWidthPx,
      height: canvasHeightPx,
      backgroundColor: 'white',
      enableRetinaScaling: false,
      selection: false,
    })

    const handleSelectionChange = () => {
      if (isSyncintSelectionRef.current) {
        return
      }
      const activeObject = fabricCanvas.getActiveObject() as
        | FabricGroupWithElementId
        | undefined
      selectElement(activeObject?.elementId || null)
    }

    const handleSelectionCleard = () => {
      if (isSyncintSelectionRef.current) {
        return
      }
      selectElement(null)
    }

    // 同步拖拽到store
    const handleObjectModified = (event: { target?: unknown }) => {
      const elementId = getElementIdFromFabricObject(event.target)

      if (!elementId) {
        return
      }

      const targetObject = event.target as FabricGroupWithElementId
      // const { widthPx, heightPx } = resizeElementGroup(targetObject)
      const partial = {
        ...syncAngleFromGroup(targetObject),
        ...syncPositionFromGroup(targetObject),
      }

      // object:modified 在操作结束后触发
      updateElement(elementId, {
        ...partial,
        ...(hasGroupScaleChanged(targetObject)
          ? syncSizeFromGroup(targetObject)
          : {}),
      })
    }
    fabricCanvas.on('selection:created', handleSelectionChange)
    fabricCanvas.on('selection:updated', handleSelectionChange)
    fabricCanvas.on('selection:cleared', handleSelectionCleard)
    fabricCanvas.on('object:modified', handleObjectModified)

    fabricCanvasRef.current = fabricCanvas
    fabricCanvas.requestRenderAll()
    return () => {
      fabricCanvas.off('selection:created', handleSelectionChange)
      fabricCanvas.off('selection:updated', handleSelectionChange)
      fabricCanvas.off('selection:cleared', handleSelectionCleard)
      fabricCanvas.off('object:modified', handleObjectModified)
      fabricCanvasRef.current = null
      void fabricCanvas.dispose()
    }
  }, [selectElement, updateElement])

  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current

    if (!fabricCanvas) {
      return
    }

    isSyncintSelectionRef.current = true
    try {
      const elementIds = new Set(elements.map((element) => element.id))
      fabricCanvas.getObjects().forEach((object) => {
        const elementId = getElementIdFromFabricObject(object)
        const labelElementId = getLabelElementIdFromFabricObject(object)
        if (elementId && !elementIds.has(elementId)) {
          // 画布有、store 没有 -> 删除
          fabricCanvas.remove(object)
        }
        if (labelElementId && !elementIds.has(labelElementId)) {
          // 画布有、store 没有 -> 删除
          fabricCanvas.remove(object)
        }
      })
      elements.forEach((element) => {
        const existingGroup = findGroupByElementId(fabricCanvas, element.id)
        // store 有、画布也有 -> 更新
        // 画布有、store 没有 -> 删除
        if (existingGroup) {
          updateElementGroup(existingGroup, element)
          // return
        } else {
          fabricCanvas.add(createElementGroup(element))
          // fabricCanvas.add(createElementLabel(element))
        }
        const existingLabel = findLabelByElementId(fabricCanvas, element.id)
        if (existingLabel) {
          updateElementLabel(existingLabel, element)
          return
        }
        fabricCanvas.add(createElementLabel(element))
      })
    } finally {
      isSyncintSelectionRef.current = false
    }

    fabricCanvas.requestRenderAll()
  }, [elements])

  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) {
      return
    }
    isSyncintSelectionRef.current = true
    try {
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
        fabricCanvas.requestRenderAll()
        return
      }
      const targetObject = findGroupByElementId(fabricCanvas, selectedElementId)

      if (!targetObject) {
        fabricCanvas.discardActiveObject()
        fabricCanvas.requestRenderAll()
        return
      }
      if (fabricCanvas.getActiveObject() !== targetObject) {
        fabricCanvas.setActiveObject(targetObject)
      }
      fabricCanvas.requestRenderAll()
    } finally {
      isSyncintSelectionRef.current = false
    }
  }, [selectedElementId, elements])

  return (
    <div
      className="border border-slate-300 bg-white shadow-sm"
      style={{
        width: canvasWidthPx,
        height: canvasHeightPx,
      }}
    >
      <canvas ref={canvasElementRef} />
    </div>
  )
}

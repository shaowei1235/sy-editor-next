'use client'

import { Canvas as FabricCanvasInstance, Textbox } from 'fabric'
import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/lib/editor/store'

import type { LabelCanvasConfig } from '@/types/editor'
type FabricTextboxWithElementId = Textbox & {
  elementId: string
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
        | FabricTextboxWithElementId
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
      const targetObject = event.target as
        | FabricTextboxWithElementId
        | undefined
      if (!targetObject?.elementId) {
        return
      }
      const actualWidthPx =
        (targetObject.width ?? 0) * (targetObject.scaleX ?? 1)
      const actualHeightPx =
        (targetObject.height ?? 0) * (targetObject.scaleY ?? 1)
      // 手动改对象属性
      targetObject.set({
        width: actualWidthPx,
        height: actualHeightPx,
        scaleX: 1,
        scaleY: 1,
      })
      //重新计算
      targetObject.setCoords()
      // 拖拽触发
      updateElement(targetObject.elementId, {
        xMm: pxToMm(targetObject.left ?? 0),
        yMm: pxToMm(targetObject.top ?? 0),
        widthMm: pxToMm(actualWidthPx),
        heightMm: pxToMm(actualHeightPx),
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
      fabricCanvas.getObjects().forEach((object) => {
        fabricCanvas.remove(object)
      })
      elements.forEach((element) => {
        const textbox = new Textbox(element.text, {
          left: mmToPx(element.xMm),
          top: mmToPx(element.yMm),
          originX: 'left',
          originY: 'top',
          width: mmToPx(element.widthMm),
          height: mmToPx(element.heightMm),
          angle: element.angle,
          fontSize: element.style.fontSize,
          fontWeight: element.style.bold ? 'bold' : 'normal',
          fontStyle: element.style.italic ? 'italic' : 'normal',
          underline: element.style.underline,
          textAlign: element.style.textAlign,
          fill: element.style.reverse ? '#ffffff' : '#111827',
          backgroundColor: element.style.reverse ? '#111827' : '',
          lineHeight: element.style.lineHeight,
          charSpacing: element.style.letterSpacing,
          splitByGrapheme: element.style.autoWrap,
        }) as FabricTextboxWithElementId

        // 保存业务元素 id，后续选中、更新、删除时可以把 Fabric 对象和 store 数据对应起来。
        textbox.elementId = element.id
        fabricCanvas.add(textbox)
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
      if (!selectedElementId) {
        fabricCanvas.discardActiveObject()
        fabricCanvas.requestRenderAll()
        return
      }
      const targetObject = fabricCanvas
        .getObjects()
        .find(
          (obj): obj is FabricTextboxWithElementId =>
            'elementId' in obj && obj.elementId === selectedElementId,
        )

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

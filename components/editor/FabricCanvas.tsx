'use client'

import { Canvas as FabricCanvasInstance } from 'fabric'
import { useEffect, useRef, useState } from 'react'

import {
  syncCanvasObjectsToElements,
  syncCanvasSelectionToElement,
} from '@/components/editor/fabric/canvasSync'
import {
  ELEMENT_PADDING_PX,
  getElementIdFromFabricObject,
  hasGroupScaleChanged,
  syncAngleFromGroup,
  syncPositionFromGroup,
  syncSizeFromGroup,
} from '@/components/editor/fabric/elementGroup'
import type {
  EditingTextState,
  FabricGroupWithElementId,
} from '@/components/editor/fabric/types'
import {
  getCanvasHeightPx,
  getCanvasWidthPx,
  mmToPx,
} from '@/components/editor/fabric/units'
import { useEditorStore } from '@/lib/editor/store'

export function FabricCanvas() {
  const canvasConfig = useEditorStore((state) => state.canvasConfig)
  const elements = useEditorStore((state) => state.elements)
  const selectedElementId = useEditorStore((state) => state.selectedElementId)
  const selectElement = useEditorStore((state) => state.selectElement)
  const updateElement = useEditorStore((state) => state.updateElement)
  const [editingText, setEditingText] = useState<EditingTextState | null>(null)
  // 原生 canvas DOM 节点
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fabricCanvasRef = useRef<FabricCanvasInstance | null>(null)
  const isSyncingSelectionRef = useRef(false)
  const canvasWidthPx = getCanvasWidthPx(canvasConfig)
  const canvasHeightPx = getCanvasHeightPx(canvasConfig)

  const finishTextEditing = () => {
    if (!editingText) {
      return
    }

    updateElement(editingText.elementId, {
      text: editingText.value,
    })
    setEditingText(null)
  }

  const cancelTextEditing = () => {
    setEditingText(null)
  }

  useEffect(() => {
    textareaRef.current?.focus()
    textareaRef.current?.select()
  }, [editingText?.elementId])

  useEffect(() => {
    if (!canvasElementRef.current) {
      return
    }

    // 组件挂载后创建 Fabric Canvas
    const fabricCanvas = new FabricCanvasInstance(canvasElementRef.current, {
      width: canvasWidthPx,
      height: canvasHeightPx,
      backgroundColor: '#ffffff',
      // 关闭 Retina 缩放
      enableRetinaScaling: false,
      selection: false,
    })

    const handleSelectionChange = () => {
      if (isSyncingSelectionRef.current) {
        return
      }

      const activeObject = fabricCanvas.getActiveObject() as
        | FabricGroupWithElementId
        | undefined

      selectElement(activeObject?.elementId ?? null)
    }

    const handleSelectionCleared = () => {
      if (isSyncingSelectionRef.current) {
        return
      }

      selectElement(null)
    }

    const handleObjectModified = (event: { target?: unknown }) => {
      const elementId = getElementIdFromFabricObject(event.target)

      if (!elementId) {
        return
      }

      const targetObject = event.target as FabricGroupWithElementId
      const currentCanvasConfig = useEditorStore.getState().canvasConfig
      const partial = {
        ...syncPositionFromGroup(targetObject, currentCanvasConfig),
        ...syncAngleFromGroup(targetObject),
      }

      updateElement(elementId, {
        ...partial,
        ...(hasGroupScaleChanged(targetObject)
          ? syncSizeFromGroup(targetObject, currentCanvasConfig)
          : {}),
      })
    }

    const handleGroupDoubleClick = (event: { target?: unknown }) => {
      const elementId = getElementIdFromFabricObject(event.target)

      if (!elementId) {
        return
      }

      const currentElement = useEditorStore
        .getState()
        .elements.find((element) => element.id === elementId)

      if (!currentElement) {
        return
      }

      selectElement(elementId)
      const currentCanvasConfig = useEditorStore.getState().canvasConfig

      setEditingText({
        elementId,
        value: currentElement.text,
        left:
          mmToPx(currentElement.xMm, currentCanvasConfig) + ELEMENT_PADDING_PX,
        top:
          mmToPx(currentElement.yMm, currentCanvasConfig) + ELEMENT_PADDING_PX,
        width: Math.max(
          mmToPx(currentElement.widthMm, currentCanvasConfig) -
            ELEMENT_PADDING_PX * 2,
          0,
        ),
        height: Math.max(
          mmToPx(currentElement.heightMm, currentCanvasConfig) -
            ELEMENT_PADDING_PX * 2,
          0,
        ),
        angle: currentElement.angle,
        fontSize: currentElement.style.fontSize,
        fontWeight: currentElement.style.bold ? '700' : '400',
        fontStyle: currentElement.style.italic ? 'italic' : 'normal',
        textAlign: currentElement.style.textAlign,
        lineHeight: currentElement.style.lineHeight,
      })
    }

    fabricCanvas.on('selection:created', handleSelectionChange)
    fabricCanvas.on('selection:updated', handleSelectionChange)
    fabricCanvas.on('selection:cleared', handleSelectionCleared)
    fabricCanvas.on('object:modified', handleObjectModified)
    fabricCanvas.on('mouse:dblclick', handleGroupDoubleClick)

    fabricCanvasRef.current = fabricCanvas
    // 重新绘制
    fabricCanvas.requestRenderAll()

    return () => {
      fabricCanvas.off('selection:created', handleSelectionChange)
      fabricCanvas.off('selection:updated', handleSelectionChange)
      fabricCanvas.off('selection:cleared', handleSelectionCleared)
      fabricCanvas.off('object:modified', handleObjectModified)
      fabricCanvas.off('mouse:dblclick', handleGroupDoubleClick)
      fabricCanvasRef.current = null
      void fabricCanvas.dispose()
    }
  }, [canvasHeightPx, canvasWidthPx, selectElement, updateElement])

  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current

    if (!fabricCanvas) {
      return
    }

    isSyncingSelectionRef.current = true

    try {
      syncCanvasObjectsToElements({
        fabricCanvas,
        elements,
        canvasConfig,
      })
    } finally {
      isSyncingSelectionRef.current = false
    }

    fabricCanvas.requestRenderAll()
  }, [canvasConfig, elements])

  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current

    if (!fabricCanvas) {
      return
    }

    isSyncingSelectionRef.current = true

    try {
      syncCanvasSelectionToElement({
        fabricCanvas,
        selectedElementId,
      })
    } finally {
      isSyncingSelectionRef.current = false
    }

    fabricCanvas.requestRenderAll()
  }, [selectedElementId, elements])

  return (
    <div
      className="relative box-content border border-slate-300 bg-white shadow-sm"
      style={{
        width: canvasWidthPx,
        height: canvasHeightPx,
      }}
    >
      <canvas ref={canvasElementRef} />
      {editingText ? (
        <textarea
          ref={textareaRef}
          className="absolute z-10 resize-none border border-cyan-500 bg-white/95 p-0 text-slate-900 outline-none ring-2 ring-cyan-200"
          style={{
            left: editingText.left,
            top: editingText.top,
            width: editingText.width,
            height: editingText.height,
            fontSize: editingText.fontSize,
            fontWeight: editingText.fontWeight,
            fontStyle: editingText.fontStyle,
            textAlign: editingText.textAlign,
            lineHeight: editingText.lineHeight,
            transform: `rotate(${editingText.angle}deg)`,
            transformOrigin: 'left top',
          }}
          value={editingText.value}
          onBlur={finishTextEditing}
          onChange={(event) =>
            setEditingText({
              ...editingText,
              value: event.target.value,
            })
          }
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              cancelTextEditing()
              return
            }

            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              finishTextEditing()
            }
          }}
        />
      ) : null}
    </div>
  )
}

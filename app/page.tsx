'use client'
import { type ChangeEvent, useRef } from 'react'
import { FieldSidebar } from '@/components/editor/LeftSide'
import { useEditorStore } from '@/lib/editor/store'
import { FabricCanvas } from '@/components/editor/FabricCanvas'
import { PrintOrderPanel } from '@/components/editor/PrintOrderPanel'
import { StyleToolbar } from '@/components/editor/StyleToolbar'
import type {
  CanvasElement,
  LabelCanvasConfig,
  TextStyle,
} from '@/types/editor'

type LabelDesingnJson = {
  canvasConfig: LabelCanvasConfig
  elements: CanvasElement[]
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null
const isCanvasConfig = (value: unknown): value is LabelCanvasConfig =>
  isRecord(value) &&
  typeof value.widthMm === 'number' &&
  typeof value.heightMm === 'number' &&
  typeof value.pxPerMm === 'number'

// const printItems = ['商品名', '価格', 'バーコード']

export default function Home() {
  // const handleAddField = (field: FieldDefinition) => {}
  // const elements = useEditorStore((state) => state.elements)
  // const selectedElementId = useEditorStore((state) => state.selectedElementId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addElementFromField = useEditorStore(
    (state) => state.addElementFromField,
  )
  const canvasConfig = useEditorStore((state) => state.canvasConfig)
  const elements = useEditorStore((state) => state.elements)
  const selectedElementId = useEditorStore((state) => state.selectedElementId)
  const updateElement = useEditorStore((state) => state.updateElement)
  const loadEditorState = useEditorStore((state) => state.loadEditorState)

  const selectedElement =
    elements.find((element) => element.id === selectedElementId) ?? null
  const updateSelectedElementStyle = (partial: Partial<TextStyle>) => {
    if (!selectedElement) {
      return
    }
    updateElement(selectedElement.id, {
      style: {
        ...selectedElement.style,
        ...partial,
      },
    })
  }

  const canSaveJson = elements.length > 0
  const handleSaveJson = () => {
    if (!canSaveJson) {
      return
    }
    const exportData = {
      // canvasConfig: LABEL_CANVAS_CONFIG,
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
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'label-design.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleReadJsonClick = () => {
    fileInputRef.current?.click()
  }
  const handleReadJsonFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    try {
      const fileText = await file.text()
      const parsedJson = JSON.parse(fileText) as unknown
      if (!isRecord(parsedJson)) {
        alert('JSON格式错误')
        return
      }
      if (!Array.isArray(parsedJson.elements)) {
        alert('JSON中缺少elements')
        return
      }
      if (!isCanvasConfig(parsedJson.canvasConfig)) {
        alert('JSON中canvasConfig格式错误')
        return
      }
      const labelDesign: LabelDesingnJson = {
        canvasConfig: parsedJson.canvasConfig,
        elements: parsedJson.elements as CanvasElement[],
      }
      loadEditorState(labelDesign)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen grid-cols-[260px_1fr_280px]">
        <FieldSidebar onAddField={addElementFromField} />

        <section className="flex flex-col p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">标签编辑器</h1>
              <p className="mt-1 text-sm text-slate-500">
                基础页面骨架，后续逐步实现编辑能力。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleReadJsonFile}
              />
              <button
                type="button"
                onClick={handleReadJsonClick}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                读取JSON
              </button>
              <button
                type="button"
                onClick={handleSaveJson}
                disabled={!canSaveJson}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                保存JSON
              </button>
            </div>
          </div>
          <StyleToolbar
            selectedElement={selectedElement}
            onUpdateStyle={updateSelectedElementStyle}
          />
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8">
            <FabricCanvas />
          </div>
        </section>
        <PrintOrderPanel />
      </div>
    </main>
  )
}

'use client'
import { type ChangeEvent, useRef } from 'react'
import { FieldSidebar } from '@/components/editor/LeftSide'
import { useEditorStore } from '@/lib/editor/store'
import { FabricCanvas } from '@/components/editor/FabricCanvas'
import { PrintOrderPanel } from '@/components/editor/PrintOrderPanel'
import { StyleToolbar } from '@/components/editor/StyleToolbar'
import type { TextStyle } from '@/types/editor'
import { createLabelDesignJson } from '@/lib/editor/labelDesignJson'
import {
  downloadLabelDesignJsonFile,
  readLabelDesignJsonFile,
} from '@/lib/editor/labelDesignFile'

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addElementFromField = useEditorStore(
    (state) => state.addElementFromField,
  )
  const canvasConfig = useEditorStore((state) => state.canvasConfig)
  const elements = useEditorStore((state) => state.elements)
  const selectedElementId = useEditorStore((state) => state.selectedElementId)
  const updateElement = useEditorStore((state) => state.updateElement)
  const loadEditorState = useEditorStore((state) => state.loadEditorState)
  const removeElement = useEditorStore((state) => state.removeElement)

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
    downloadLabelDesignJsonFile(createLabelDesignJson(canvasConfig, elements))
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
      const labelDesign = await readLabelDesignJsonFile(file)
      loadEditorState(labelDesign)
    } catch {
      alert('JSON形式が正しくありません')
    }
  }

  const handleDeleteElement = () => {
    if (!selectedElementId) {
      return
    }
    const confirmed = window.confirm('選択中の要素を削除してもよろしいですか？')
    if (!confirmed) {
      return
    }
    removeElement(selectedElementId)
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen grid-cols-[260px_1fr_280px]">
        <FieldSidebar onAddField={addElementFromField} />

        <section className="flex flex-col p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">ラベルエディター</h1>
              <p className="mt-1 text-sm text-slate-500">
                商品ラベルの項目配置、編集、印字順を管理できます。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteElement}
                disabled={!selectedElementId}
                className="mr-3 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:hover:border-slate-200 disabled:hover:text-slate-400"
              >
                削除
              </button>
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
                JSON読込
              </button>
              <button
                type="button"
                onClick={handleSaveJson}
                disabled={!canSaveJson}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                JSON保存
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

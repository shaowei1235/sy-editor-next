'use client'

import { EditorTopBar } from '@/components/editor/EditorTopBar'
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

  const canSaveJson = elements.length > 0
  const handleSaveJson = () => {
    if (!canSaveJson) {
      return
    }
    downloadLabelDesignJsonFile(createLabelDesignJson(canvasConfig, elements))
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
  const handleReadJsonFile = async (file: File) => {
    try {
      const labelDesign = await readLabelDesignJsonFile(file)
      loadEditorState(labelDesign)
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'JSON形式が正しくありません',
      )
    }
  }

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

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen grid-cols-[260px_1fr_280px]">
        <FieldSidebar onAddField={addElementFromField} />

        <section className="flex flex-col p-8">
          <EditorTopBar
            hasExistingElements={elements.length > 0}
            canDeleteElement={selectedElementId !== null}
            canSaveJson={canSaveJson}
            onDeleteElement={handleDeleteElement}
            onReadJsonFile={handleReadJsonFile}
            onSaveJson={handleSaveJson}
          />
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

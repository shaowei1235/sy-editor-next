'use client'

import { FieldSidebar } from '@/components/editor/LeftSide'
import { useEditorStore } from '@/lib/editor/store'
import { FabricCanvas } from '@/components/editor/FabricCanvas'
import { PrintOrderPanel } from '@/components/editor/PrintOrderPanel'
import { StyleToolbar } from '@/components/editor/StyleToolbar'
import type { TextStyle } from '@/types/editor'

// const printItems = ['商品名', '価格', 'バーコード']

export default function Home() {
  // const handleAddField = (field: FieldDefinition) => {}
  // const elements = useEditorStore((state) => state.elements)
  // const selectedElementId = useEditorStore((state) => state.selectedElementId)
  const addElementFromField = useEditorStore(
    (state) => state.addElementFromField,
  )

  const elements = useEditorStore((state) => state.elements)
  const selectedElementId = useEditorStore((state) => state.selectedElementId)
  const updateElement = useEditorStore((state) => state.updateElement)
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

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen grid-cols-[260px_1fr_280px]">
        <FieldSidebar onAddField={addElementFromField} />

        <section className="flex flex-col p-8">
          <div className="mb-5">
            <h1 className="text-2xl font-bold">标签编辑器</h1>
            <p className="mt-1 text-sm text-slate-500">
              基础页面骨架，后续逐步实现编辑能力。
            </p>
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

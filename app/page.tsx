'use client'

import { FieldSidebar } from '@/components/editor/LeftSide'
import { useEditorStore } from '@/lib/editor/store'
import { FabricCanvas } from '@/components/editor/FabricCanvas'

const printItems = ['商品名', '価格', 'バーコード']

export default function Home() {
  // const handleAddField = (field: FieldDefinition) => {}
  // const elements = useEditorStore((state) => state.elements)
  // const selectedElementId = useEditorStore((state) => state.selectedElementId)
  const addElementFromField = useEditorStore(
    (state) => state.addElementFromField,
  )
  // const selectElement = useEditorStore((state) => state.selectElement)

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
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8">
            <FabricCanvas />
          </div>
        </section>

        <aside className="border-l border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">右侧打印顺序列表</h2>
          <ol className="mt-5 space-y-3">
            {printItems.map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  )
}

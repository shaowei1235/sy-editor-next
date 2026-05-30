'use client'

import { FieldSidebar } from '@/components/editor/LeftSide'
import type { FieldDefinition } from '@/types/editor'
import { useEditorStore } from '@/lib/editor/store'

const printItems = ['商品名', '価格', 'バーコード']

export default function Home() {
  // const handleAddField = (field: FieldDefinition) => {}
  const elements = useEditorStore((state) => state.elements)
  const selectedElementId = useEditorStore((state) => state.selectedElementId)
  const addElementFromField = useEditorStore(
    (state) => state.addElementFromField,
  )
  const selectElement = useEditorStore((state) => state.selectElement)

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
            <div className="h-[360px] w-[520px] rounded-md border border-slate-300 bg-slate-50 p-5 shadow-sm">
              {elements.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  中间画布区域
                </div>
              ) : (
                <div className="space-y-3">
                  {elements.map((element) => {
                    const isSelected = element.id === selectedElementId

                    return (
                      <button
                        key={element.id}
                        type="button"
                        onClick={() => selectElement(element.id)}
                        className={[
                          'w-full rounded-md border px-4 py-3 text-left text-sm transition-colors',
                          isSelected
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-slate-200 bg-white hover:border-slate-300',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">
                            {element.displayName}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">
                            #{element.printOrder}
                          </span>
                        </div>
                        <p className="mt-2 text-slate-600">{element.text}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
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

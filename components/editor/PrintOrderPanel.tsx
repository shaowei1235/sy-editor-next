'use client'
import { useMemo } from 'react'
import { useEditorStore } from '@/lib/editor/store'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { CanvasElement } from '@/types/editor'

type SortablePrintOrderItemProps = {
  element: CanvasElement
  isSelected: boolean
  onSelect: (id: string) => void
}

function SortablePrintOrderItem({
  element,
  isSelected,
  onSelect,
}: SortablePrintOrderItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: element.id,
    })

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => onSelect(element.id)}
        className="flex w-full cursor-grab items-start gap-3 rounded-md border bg-slate-50 px-4 py-3 text-left text-sm transition-colors hover:bg-white active:cursor-grabbing data-[selected=true]:border-cyan-500 data-[selected=false]:border-slate-200 data-[selected=true]:bg-cyan-50"
        data-selected={isSelected}
        aria-label={`${element.displayName}の並び替え`}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {element.printOrder}
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-slate-900">
            {element.displayName}
          </span>
          <span className="mt-1 block truncate text-xs text-slate-500">
            {element.text}
          </span>
        </span>
      </div>
    </li>
  )
}

export function PrintOrderPanel() {
  const elements = useEditorStore((state) => state.elements)
  const selectedElementId = useEditorStore((state) => state.selectedElementId)
  const selectElement = useEditorStore((state) => state.selectElement)
  const reorderElementsByIds = useEditorStore(
    (state) => state.reorderElementsByIds,
  )
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const sortedElements = useMemo(
    () =>
      [...elements].sort((leftElement, rightElement) => {
        if (leftElement.printOrder !== rightElement.printOrder) {
          return leftElement.printOrder - rightElement.printOrder
        }

        return leftElement.displayName.localeCompare(rightElement.displayName)
      }),
    [elements],
  )
  const sortedElementIds = useMemo(
    () => sortedElements.map((element) => element.id),
    [sortedElements],
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sortedElementIds.indexOf(String(active.id))
    const newIndex = sortedElementIds.indexOf(String(over.id))

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    reorderElementsByIds(arrayMove(sortedElementIds, oldIndex, newIndex))
  }

  return (
    <aside className="border-l border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold">右侧打印顺序列表</h2>

      {sortedElements.length === 0 ? (
        <p className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          还没有添加字段
        </p>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedElementIds}
            strategy={verticalListSortingStrategy}
          >
            <ol className="mt-5 space-y-3">
              {sortedElements.map((element) => (
                <SortablePrintOrderItem
                  key={element.id}
                  element={element}
                  isSelected={element.id === selectedElementId}
                  onSelect={selectElement}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </aside>
  )
}

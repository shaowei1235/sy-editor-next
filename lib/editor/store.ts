import { create } from 'zustand'

import type { CanvasElement, FieldDefinition, TextStyle } from '@/types/editor'

type EditorStore = {
  elements: CanvasElement[]
  selectedElementId: string | null
  addElementFromField: (field: FieldDefinition) => void
  selectElement: (id: string | null) => void
  updateElement: (id: string, partial: Partial<CanvasElement>) => void
  removeElement: (id: string) => void
}

const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 12,
  bold: false,
  italic: false,
  underline: false,
  reverse: false,
  textAlign: 'left',
  verticalAlign: 'top',
  letterSpacing: 0,
  lineHeight: 1.2,
  autoWrap: true,
  equalSpacing: false,
  border: false,
}

// 画布id
const createElementId = () => crypto.randomUUID()

export const useEditorStore = create<EditorStore>((set) => ({
  elements: [],
  selectedElementId: null,

  addElementFromField: (field) => {
    set((state) => {
      const sameFieldElemets = state.elements.filter(
        (e) => e.fieldKey === field.key,
      )
      // label+1
      const instanceNo = sameFieldElemets.reduce((prev, cur) => {
        return Math.max(prev, cur.instanceNo) + 1
      }, 0)
      const element: CanvasElement = {
        id: createElementId(),
        fieldKey: field.key,
        fieldLabel: field.label,
        instanceNo,
        displayName: `${field.label}${instanceNo}`,
        printOrder: state.elements.length + 1,
        xMm: 5,
        yMm: 5,
        widthMm: field.defaultWidthMm,
        heightMm: field.defaultHeightMm,
        angle: 0,
        text: field.defaultText,
        style: { ...DEFAULT_TEXT_STYLE },
      }
      return {
        elements: [...state.elements, element],
        selectedElementId: element.id,
      }
    })
  },
  selectElement: (id) => set({ selectedElementId: id }),
  updateElement: (id, partial) => {
    set((state) => ({
      elements: state.elements.map((e) =>
        e.id === id ? { ...e, ...partial } : e,
      ),
    }))
  },
  removeElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((e) => e.id !== id),
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
    }))
  },
}))

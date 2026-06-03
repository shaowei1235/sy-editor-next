'use client'

import { FIELD_DEFINITIONS } from '@/lib/editor/fields'
import type { FieldDefinition } from '@/types/editor'

type FieldSidebarProps = {
  onAddField: (field: FieldDefinition) => void
}

export function FieldSidebar({ onAddField }: FieldSidebarProps) {
  return (
    <aside className="border-r border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold">項目一覧</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {FIELD_DEFINITIONS.map((field) => (
          <button
            key={field.key}
            type="button"
            onClick={() => onAddField(field)}
            className="flex min-h-16 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium transition-colors hover:border-slate-300 hover:bg-white"
          >
            <span
              aria-hidden="true"
              className="h-4 w-4 shrink-0 rounded border border-slate-400 bg-white"
            />
            <span className="leading-5">{field.label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}

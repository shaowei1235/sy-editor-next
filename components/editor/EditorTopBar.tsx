'use client'

import { type ChangeEvent, useRef } from 'react'

type EditorTopBarProps = {
  canDeleteElement: boolean
  canSaveJson: boolean
  hasExistingElements: boolean
  onDeleteElement: () => void
  onReadJsonFile: (file: File) => void
  onSaveJson: () => void
}

export function EditorTopBar({
  canDeleteElement,
  canSaveJson,
  hasExistingElements,
  onDeleteElement,
  onReadJsonFile,
  onSaveJson,
}: EditorTopBarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleReadJsonClick = () => {
    if (hasExistingElements) {
      const confirmed = window.confirm(
        '現在のデザインが上書きされます。保存していない場合は先にJSON保存してください。続行しますか？',
      )

      if (!confirmed) {
        return
      }
    }

    fileInputRef.current?.click()
  }

  const handleReadJsonFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    onReadJsonFile(file)
  }

  return (
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
          onClick={onDeleteElement}
          disabled={!canDeleteElement}
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
          onClick={onSaveJson}
          disabled={!canSaveJson}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          JSON保存
        </button>
      </div>
    </div>
  )
}

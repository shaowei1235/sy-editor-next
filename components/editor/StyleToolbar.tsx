'use client'

import type { CanvasElement, TextStyle } from '@/types/editor'

type StyleToolbarProps = {
  selectedElement: CanvasElement | null
  onUpdateStyle: (partial: Partial<TextStyle>) => void
}

const textAlignOptions: TextStyle['textAlign'][] = ['left', 'center', 'right']
const verticalAlignOptions: Array<{
  label: string
  value: TextStyle['verticalAlign']
}> = [
  { label: '上对齐', value: 'top' },
  { label: '垂直居中', value: 'middle' },
  { label: '下对齐', value: 'bottom' },
]

export function StyleToolbar({
  selectedElement,
  onUpdateStyle,
}: StyleToolbarProps) {
  const disabled = !selectedElement
  const style = selectedElement?.style

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        字号
        <input
          className="h-8 w-20 rounded border border-slate-300 px-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          type="number"
          min={8}
          max={96}
          step={1}
          value={style?.fontSize ?? 12}
          disabled={disabled}
          onChange={(event) =>
            onUpdateStyle({ fontSize: Number(event.target.value) })
          }
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        字间距
        <input
          className="h-8 w-20 rounded border border-slate-300 px-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          type="number"
          min={0}
          step={10}
          value={style?.letterSpacing ?? 0}
          disabled={disabled}
          onChange={(event) =>
            onUpdateStyle({ letterSpacing: Number(event.target.value) })
          }
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        行高
        <input
          className="h-8 w-20 rounded border border-slate-300 px-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          type="number"
          min={0.8}
          step={0.1}
          value={style?.lineHeight ?? 1.2}
          disabled={disabled}
          onChange={(event) =>
            onUpdateStyle({ lineHeight: Number(event.target.value) })
          }
        />
      </label>

      <div className="flex items-center overflow-hidden rounded border border-slate-300">
        <button
          className="h-8 px-3 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
          type="button"
          disabled={disabled}
          data-active={style?.bold}
          onClick={() => onUpdateStyle({ bold: !style?.bold })}
        >
          B
        </button>
        <button
          className="h-8 border-l border-slate-300 px-3 text-sm italic disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
          type="button"
          disabled={disabled}
          data-active={style?.italic}
          onClick={() => onUpdateStyle({ italic: !style?.italic })}
        >
          I
        </button>
        <button
          className="h-8 border-l border-slate-300 px-3 text-sm underline disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
          type="button"
          disabled={disabled}
          data-active={style?.underline}
          onClick={() => onUpdateStyle({ underline: !style?.underline })}
        >
          U
        </button>
      </div>

      <div className="flex items-center overflow-hidden rounded border border-slate-300">
        {textAlignOptions.map((textAlign) => (
          <button
            className="h-8 border-l border-slate-300 px-3 text-sm first:border-l-0 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
            key={textAlign}
            type="button"
            disabled={disabled}
            data-active={style?.textAlign === textAlign}
            onClick={() => onUpdateStyle({ textAlign })}
          >
            {textAlign}
          </button>
        ))}
      </div>
      <div className="flex items-center overflow-hidden rounded border border-slate-300">
        {verticalAlignOptions.map((option) => (
          <button
            className="h-8 border-l border-slate-300 px-3 text-sm first:border-l-0 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
            key={option.value}
            type="button"
            disabled={disabled}
            data-active={style?.verticalAlign === option.value}
            onClick={() => onUpdateStyle({ verticalAlign: option.value })}
          >
            {option.label}
          </button>
        ))}
      </div>
      <label className="flex h-8 items-center gap-2 rounded border border-slate-300 px-3 text-sm font-medium text-slate-700 has-disabled:cursor-not-allowed has-disabled:bg-slate-100 has-disabled:text-slate-400">
        <input
          type="checkbox"
          checked={style ? !style.border : false}
          disabled={disabled}
          onChange={(event) => onUpdateStyle({ border: !event.target.checked })}
        />
        无边框
      </label>
    </div>
  )
}

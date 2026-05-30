'use client'

import { Canvas as FabricCanvasInstance } from 'fabric'
import { useEffect, useRef } from 'react'

import type { LabelCanvasConfig } from '@/types/editor'

const CANVAS_CONFIG: LabelCanvasConfig = {
  widthMm: 60,
  heightMm: 40,
  pxPerMm: 8,
}

const canvasWidthPx = CANVAS_CONFIG.widthMm * CANVAS_CONFIG.pxPerMm
const canvasHeightPx = CANVAS_CONFIG.heightMm * CANVAS_CONFIG.pxPerMm

export function FabricCanvas() {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  const fabricCanvasRef = useRef<FabricCanvasInstance | null>(null)

  useEffect(() => {
    if (!canvasElementRef.current) {
      return
    }
    const fabricCanvas = new FabricCanvasInstance(canvasElementRef.current, {
      width: canvasWidthPx,
      height: canvasHeightPx,
      backgroundColor: 'white',
      selection: false,
      enableSelection: false,
    })
    fabricCanvasRef.current = fabricCanvas
    return () => {
      fabricCanvasRef.current = null
      void fabricCanvas.dispose()
    }
  }, [])

  return (
    <div
      className="border border-slate-300 bg-white shadow-sm"
      style={{
        width: canvasWidthPx,
        height: canvasHeightPx,
      }}
    >
      <canvas ref={canvasElementRef} />
    </div>
  )
}

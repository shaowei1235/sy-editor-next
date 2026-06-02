import type { Group, Text } from 'fabric'

import type { CanvasElement } from '@/types/editor'

export type FabricGroupWithElementId = Group & {
  elementId: string
  borderEnabled: boolean
  verticalAlign: CanvasElement['style']['verticalAlign']
}

export type FabricLabelWithElementId = Text & {
  labelForElementId: string
}

export type FabricPrintOrderWithElementId = Text & {
  printOrderForElementId: string
}

export type EditingTextState = {
  elementId: string
  value: string
  left: number
  top: number
  width: number
  height: number
  angle: number
  fontSize: number
  fontWeight: string
  fontStyle: string
  textAlign: CanvasElement['style']['textAlign']
  lineHeight: number
}

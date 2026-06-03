import {
  getLabelDesignJsonValidationError,
  isLabelDesignJson,
} from '@/lib/editor/labelDesignJson'

import type { LabelDesignJson } from '@/lib/editor/labelDesignJson'

const DEFAULT_JSON_FILE_NAME = 'label-design.json'

export const downloadLabelDesignJsonFile = (
  labelDesign: LabelDesignJson,
  fileName = DEFAULT_JSON_FILE_NAME,
) => {
  const blob = new Blob([JSON.stringify(labelDesign, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export const readLabelDesignJsonFile = async (
  file: File,
): Promise<LabelDesignJson> => {
  const fileText = await file.text()
  let parsedJson: unknown

  try {
    parsedJson = JSON.parse(fileText) as unknown
  } catch {
    throw new Error('JSON形式が正しくありません')
  }

  const validationError = getLabelDesignJsonValidationError(parsedJson)

  if (validationError || !isLabelDesignJson(parsedJson)) {
    throw new Error(validationError ?? 'JSON形式が正しくありません')
  }

  return {
    canvasConfig: parsedJson.canvasConfig,
    elements: parsedJson.elements,
  }
}

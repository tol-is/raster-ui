import React from "react"
import { css } from "@emotion/css"

const precision = 4
const toPrecision = (input, precision) => {
  return input.toPrecision(precision)
}

const toBaseline = (baseline) => (num) => {
  return Math.round(num / baseline) * baseline
}

export const Text = ({ children, font, fontSize, baseline = 4, lineGap = 1, snap = true, className = "" }) => {
  const descentAbsolute = Math.abs(font.descender)
  const contentArea = font.ascender + font.lineGap + descentAbsolute

  const contentAreaRatio = contentArea / font.unitsPerEm
  const descentRatio = descentAbsolute / font.unitsPerEm
  const ascentRatio = font.ascender / font.unitsPerEm
  const lineGapRatio = font.lineGap / font.unitsPerEm
  const lineGapRatioHalf = lineGapRatio / 2
  const capHeightRatio = font.capHeight / font.unitsPerEm
  const capHeight = fontSize * capHeightRatio

  const ascentHeight = ascentRatio * fontSize
  const descentHeight = descentRatio * fontSize

  const xHeightRatio = font.xHeight / font.unitsPerEm
  const xHeight = fontSize * xHeightRatio

  const rowHeight = snap ? toBaseline(baseline)(capHeight) : capHeight
  const rowHeightRatio = rowHeight / fontSize

  const lineHeight = snap ? rowHeight + lineGap * baseline : Math.round(rowHeight + lineGap * baseline)
  const contentAreaHeight = contentAreaRatio * fontSize
  const lineHeightOffset = contentAreaHeight - lineHeight
  const lineHeightOffsetHalf = lineHeightOffset / 2
  const lineHeightOffsetHalfRatio = lineHeightOffsetHalf / fontSize

  const trimTop = ascentRatio - rowHeightRatio + lineGapRatioHalf - lineHeightOffsetHalfRatio

  const trimBottom = descentRatio + lineGapRatioHalf - lineHeightOffsetHalfRatio

  const lineHeightValue = lineHeight
  const trimTopValue = toPrecision(trimTop * fontSize, precision) * -1
  const trimBottomValue = toPrecision(trimBottom * fontSize, precision) * -1

  return (
    <span
      className={css`
        position: relative;
        max-width: 65ch;
        display: block;
        font-family: "${font.familyName}";
        font-weight: ${font.weightClass};
        font-size: ${fontSize}px;
        font-size: ${fontSize}px;
        line-height: ${(lineHeightValue / fontSize).toFixed(3)};
        &::before {
          content: "";
          margin-bottom: ${trimTopValue}px;
          display: table;
        }
        &::after {
          content: "";
          margin-top: ${trimBottomValue}px;
          display: table;
        }
        &:focus {
          outline: none;
        }
        ${className}
      `}>
      {children}
    </span>
  )
}

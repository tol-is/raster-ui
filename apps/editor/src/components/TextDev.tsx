import React, { useEffect, useState } from "react"
import { css } from "@emotion/css"

import { Text } from "./Text"

const precision = 4
const toPrecision = (input, precision) => {
  return input.toPrecision(precision)
}

const toBaseline = (baseline) => (num) => {
  return Math.round(num / baseline) * baseline
}

const getAutolineGap = ({ fontSize, lineHeight, rowHeight, baseline, gravity }) => {
  const lineHeightPx = fontSize * lineHeight
  const lead = gravity ? Math.round((lineHeightPx - rowHeight) / baseline) : (lineHeightPx - rowHeight) / baseline
  return lead
}

export const TextDev = ({ id, children, font, fontSize, baseline = 4, lineHeight = 1, gravity = true, debug = false, className = "" }) => {
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

  const rowHeight = gravity ? toBaseline(baseline)(capHeight) : capHeight
  const rowHeightRatio = rowHeight / fontSize

  const lineGap = getAutolineGap({ fontSize, lineHeight, rowHeight, baseline, gravity })

  const lineHeightText = gravity ? rowHeight + lineGap * baseline : Math.round(rowHeight + lineGap * baseline)
  const contentAreaHeight = contentAreaRatio * fontSize
  const lineHeightOffset = contentAreaHeight - lineHeightText
  const lineHeightOffsetHalf = lineHeightOffset / 2
  const lineHeightOffsetHalfRatio = lineHeightOffsetHalf / fontSize

  const trimTop = ascentRatio - rowHeightRatio + lineGapRatioHalf - lineHeightOffsetHalfRatio

  const trimBottom = descentRatio + lineGapRatioHalf - lineHeightOffsetHalfRatio

  const trimTopValue = toPrecision(trimTop * fontSize, precision) * -1
  const trimBottomValue = toPrecision(trimBottom * fontSize, precision) * -1

  const lineHeightValue = Math.round(rowHeight + lineGap * baseline)

  return (
    <div
      id={id}
      className={css`
        position: relative;
        display: block;
        padding-top: 24px;
        ${className}
      `}>
      <div
        className={css`
          opacity: 0.6;
          position: absolute;
          margin-top: -24px;
          display: block;
          font-size: 11px;
          font-family: monospace;
        `}>
        <div>
          {fontSize}/{lineHeightValue}
        </div>
      </div>
      <div
        className={css`
          position: relative;
          display: block;
          ${debug &&
          `background-color: rgba(255, 255, 255, 0.1);
          background-repeat: repeat;
            background-size: 100% ${baseline}px;
            background-image: linear-gradient(
              rgba(255, 0, 255, 0) 1px,
              transparent 0
              );
              
              `}
        `}>
        <Text font={font} fontSize={fontSize} baseline={baseline} lineGap={lineGap} snap={gravity}>
          {children}
        </Text>

        {debug && (
          <>
            <div
              className={css`
                position: absolute;
                top: 0;
                width: 100%;
                bottom: 0;
                display: block;
                overflow: hidden;
              `}>
              <Box
                trimTop={trimTopValue}
                trimBottom={trimBottomValue}
                height={lineHeightText}
                size={lineGap * baseline}
                top={capHeight}
                hex="rgba(255,255,255,0.1)"
              />
            </div>
            {/* <Ruler trimTop={trimTopValue} trimBottom={trimBottomValue} height={lineHeightText} ruler={0} hex="#00ffcc" /> */}
            {/* <Ruler trimTop={trimTopValue} trimBottom={trimBottomValue} height={lineHeightText} ruler={capHeight} hex="#00ffcc" /> */}
            {/* <Ruler
              trimTop={trimTopValue}
              trimBottom={trimBottomValue}
              height={lineHeightText}
              ruler={(ascentHeight - capHeight) * -1}
              hex="#000"
            />
            <Ruler
              trimTop={trimTopValue}
              trimBottom={trimBottomValue}
              height={lineHeightText}
              ruler={capHeight + descentHeight}
              hex="#F50B86"
            /> */}
          </>
        )}
      </div>
    </div>
  )
}

const Box = ({ trimTop, trimBottom, top, height, size, hex = "#ff00cc" }) => {
  return (
    <div
      className={css`
        position: absolute;
        width: 100%;
        top: ${trimTop}px;
        bottom: ${trimBottom}px;
        background-repeat: repeat;
        background-position: 0 ${trimTop * -1 + top}px;
        background-size: 100% ${height}px;

        background-image: linear-gradient(${hex} ${size}px, transparent 0);
      `}></div>
  )
}

const Ruler = ({ trimTop, trimBottom, ruler, height, hex = "#ff00cc" }) => {
  return (
    <div
      className={css`
        position: absolute;
        width: 100%;
        top: ${trimTop}px;
        bottom: ${trimBottom}px;
        background-repeat: repeat;
        background-position: 0 ${trimTop * -1 + ruler}px;
        background-size: 100% ${height}px;

        background-image: linear-gradient(${hex} 1px, transparent 0);
      `}></div>
  )
}

/*

{debug && (
          <>
            <Box
              trimTop={trimTopValue}
              trimBottom={trimBottomValue}
              height={lineHeight}
              size={lineGap * baseline}
              top={capHeight}
              hex="rgba(255,255,255,0.1)"
            />
            <Ruler trimTop={trimTopValue} trimBottom={trimBottomValue} height={lineHeight} ruler={0} hex="#00ffcc" />
            <Ruler trimTop={trimTopValue} trimBottom={trimBottomValue} height={lineHeight} ruler={capHeight} hex="#000" />
            <Ruler
              trimTop={trimTopValue}
              trimBottom={trimBottomValue}
              height={lineHeight}
              ruler={(ascentHeight - capHeight) * -1}
              hex="#000"
            />
            <Ruler
              trimTop={trimTopValue}
              trimBottom={trimBottomValue}
              height={lineHeight}
              ruler={capHeight + descentHeight}
              hex="#F50B86"
            />
          </>
        )}

        */

import React, { useEffect, useState } from "react"
import { css } from "@emotion/css"

import { Text } from "./Text"

const getAutolineGap = ({ fontSize, lineHeight, rowHeight, baseline }) => {
  const lineHeightPx = fontSize * lineHeight
  const lead = Math.round((lineHeightPx - rowHeight) / baseline)

  return lead
}

const toBaseline = (baseline) => (num) => {
  return Math.round(num / baseline) * baseline
}

export const TextDev = ({
  children,
  font,
  fontSize,
  baseline = 4,
  lineHeight = 1,
  tension = 0,
  gravity = true,

  className = "",
}) => {
  const capHeightRatio = font.capHeight / font.unitsPerEm
  const capHeight = fontSize * capHeightRatio

  const rowHeight = gravity ? toBaseline(baseline)(capHeight) : capHeight

  const lineGap = tension + getAutolineGap({ fontSize, lineHeight, rowHeight, baseline })

  const lineHeightValue = Math.round(rowHeight + lineGap * baseline)

  return (
    <div
      className={css`
        position: relative;
        display: block;
        ${className}
      `}>
      <div
        className={css`
          opacity: 0.6;

          display: block;
          font-size: 11px;
          font-family: monospace;
          margin-bottom: 12px;
        `}>
        <div>
          {fontSize}/{lineHeightValue}
        </div>
      </div>
      <div
        className={css`
          position: relative;
          display: block;
        `}>
        <Text font={font} fontSize={fontSize} baseline={baseline} lineGap={lineGap} snap={gravity}>
          {children}
        </Text>
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
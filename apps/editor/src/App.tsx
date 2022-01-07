import { css, injectGlobal } from "@emotion/css"
import { TFontMetrics, fromBlob, fromUrl } from "@raster-ui/fontkit"
import { carbonScale } from "@raster-ui/scales"
import { useTweaks, makeFolder, makeSeparator, makeButton } from "use-tweaks"

import { folder, useControls, buttonGroup } from "leva"
import { plot } from "@leva-ui/plugin-plot"

import { useEffect, useMemo, useRef, useState } from "react"

import { Text } from "./components/Text"
import { TextDev } from "./components/TextDev"

import text from "./text.json"

//
const defaultFontUrl = "/fonts/Commissioner[FLAR,VOLM,slnt,wght].ttf"

export const interpolate = (value, s1, s2, t1, t2, slope) => {
  slope = slope || s2 - s1

  if (value < Math.min(s1, s2)) {
    return Math.min(s1, s2) === s1 ? t1 : t2
  }

  if (value > Math.max(s1, s2)) {
    return Math.max(s1, s2) === s1 ? t1 : t2
  }

  value = s2 - value

  var C1 = { x: s1, y: t1 }
  var C3 = { x: s2, y: t2 }
  var C2 = {
    x: C3.x,
    y: slope,
  }

  var percent = value / (C3.x - C1.x)

  var result = C1.y * b1(percent) + C2.y * b2(percent) + C3.y * b3(percent)

  return result.toFixed(2)

  function b1(t) {
    return t * t
  }
  function b2(t) {
    return 2 * t * (1 - t)
  }
  function b3(t) {
    return (1 - t) * (1 - t)
  }
}

export const App = () => {
  const inputRef = useRef(null)
  const tweaksRef = useRef(null)
  const [otf, setOtf] = useState<TFontMetrics | null>(null)
  const [debug, setDebug] = useState<boolean>(false)
  // const caps = (v) => interpolate(v, 14, 72, 1.3, 0.9, 0.99)

  const [{ font }] = useControls(() => ({
    font: {
      value: "/fonts/Commissioner[FLAR,VOLM,slnt,wght].ttf",
      options: {
        Commissioner: "/fonts/Commissioner[FLAR,VOLM,slnt,wght].ttf",
        Averta: "/fonts/AvertaPE-Regular.otf",
        Inter: "/fonts/Inter.otf",
        "IBM Plex Sans": "https://fonts.gstatic.com/s/ibmplexsans/v9/zYXgKVElMYYaJe8bpLHnCwDKhdHeFaxOedc.woff2",
        "IBM Plex Serif": "https://fonts.gstatic.com/s/ibmplexserif/v10/jizDREVNn1dOx-zrZ2X3pZvkTiUf2zcZiVbJ.woff2",
        "Playfair Display":
          "https://fonts.gstatic.com/s/playfairdisplay/v25/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vXDXbtXK-F2qC0s.woff",
        Roboto: "https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
        "Roboto Condensed": "https://fonts.gstatic.com/s/robotocondensed/v19/ieVl2ZhZI2eCN5jzbjEETS9weq8-19K7DQk6YvM.woff2",
        "Fira Sans": "https://fonts.gstatic.com/s/firasans/v11/va9E4kDNxMZdWfMOD5Vvl4jLazX3dA.woff2",
        "Fira Code": "https://fonts.gstatic.com/s/firacode/v14/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_A9sJVD7MOzlojwUKQ.woff",
        "JetBrains Mono": "/fonts/JetBrainsMono-Regular.ttf",
      },
    },
  }))

  const { length, base, interval, step } = useControls({
    Typescale: folder(
      {
        length: { min: 1, max: 24, value: 14, step: 1 },
        base: { min: 14, max: 24, value: 16, step: 1 },
        interval: { min: 1, max: 4, value: 2, step: 1 },
        step: { min: 1, max: 4, value: 2, step: 1 },
      },
      { collapsed: false },
    ),
  })

  const { gravity, tension, space } = useControls({
    Environment: folder(
      {
        gravity: false,
        tension: {
          value: 0,
          min: -1,
          max: 1,
          step: 0.2,
        },
        space: {
          value: 4,
          min: 2,
          max: 8,
          step: 1,
        },
      },
      { collapsed: false },
    ),
  })

  const start = (v) => 1 + parseFloat(interpolate(v, -1, 1, 0.2, 0.8, 0.5))
  const end = (v) => 1 + parseFloat(interpolate(v, -1, 1, -0.05, 0.05, 0.5))
  const lineHeight = (v) => interpolate(v, 16, 96, start(tension), end(tension), 1)

  useEffect(() => {
    fromUrl(font).then((otf) => {
      applyFont(font, otf)
    })
  }, [font])

  const applyFont = (fontData, font: TFontMetrics) => {
    if (!font) return
    setOtf(font)

    const fontFace = `
    @font-face {
      font-family: '${font.familyName}';
      font-style: ${font.italicAngle !== 0 ? "italic" : "normal"};
      font-weight: ${font.weightClass};
      src: url('${fontData}')
          format('opentype');
    }
  `
    injectGlobal`${fontFace}`
  }

  const onFileChange = (e) => {
    let file = e.target.files && e.target.files[0]
    if (!file) return

    var reader = new FileReader()
    reader.onload = function (e) {
      fromBlob(file).then((metrics) => {
        applyFont(reader.result, metrics)
      })
    }
    reader.readAsDataURL(file)
  }

  const scale = useMemo(() => {
    return carbonScale({ base: base, interval: interval, step: step })
  }, [base, interval, step])

  return (
    <>
      <div
        className={css`
          position: fixed;
          top: 0;
          z-index: 100;
          visibility: hidden;
        `}>
        <input type="file" onChange={onFileChange} ref={inputRef} />
      </div>
      <div
        ref={tweaksRef}
        className={css`
          position: fixed;
          top: 5vw;
          right: 1vw;
          z-index: 100;
        `}
      />

      {otf && (
        <div
          className={css`
            padding: ${space * 10}px 2vw;
            display: grid;
            grid-template-columns: 128px 1fr;
            background-color: #080808;
            color: #ffffff;
            column-gap: 32px;
            ${debug &&
            `
            background-repeat: repeat;
            background-size: 100% ${space}px;
            background-image: linear-gradient(
              rgba(107, 0, 107, 1) 1px,
              transparent 0
              );
            `}
          `}>
          <div
            className={css`
              position: relative;

              text-align: center;
            `}>
            {Array.from(new Array(length)).map((_, i) => (
              <Text
                fontSize={scale(i)}
                font={otf}
                className={css`
                  margin-bottom: ${space * 6}px;
                  font-variation-settings: "wght" 400;
                `}>
                a
              </Text>
            ))}
          </div>
          <div>
            <div
              onDoubleClick={() => setDebug(!debug)}
              className={css`
                padding-left: 32px;
                display: grid;
                row-gap: ${space * 10}px;
                align-items: start;
                width: 100%;

                min-height: 100vh;
              `}>
              {Array.from(new Array(length)).map((_, i) => (
                <TextDev
                  fontSize={scale(i)}
                  baseline={space}
                  lineHeight={lineHeight(scale(i))}
                  tension={0}
                  font={otf}
                  gravity={gravity}
                  debug={debug}
                  className={css`
                    margin-bottom: ${space * 7}px;
                    font-variation-settings: "wght" 400;
                  `}>
                  {text[i]}
                </TextDev>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

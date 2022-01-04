import { Font } from "./lib-font";
import blobToBuffer from "blob-to-buffer";
import fk from "fontkit-browserified";
import fetch from "cross-fetch";

function toArrayBuffer(buf: Buffer) {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

export type TFontMetrics = {
  familyName?: string;
  familySubName?: string;
  familyClass: number;
  unitsPerEm: number;
  capHeight: number;
  ascender: number;
  descender: number;
  lineGap: number;
  xHeight: number;
  weightClass: number;
  widthClass: number;
  avgCharWidth: number;
  italicAngle: number;
  underlinePosition: number;
  underlineThickness: number;
  scripts?: string[];
  features?: string[];
  variable?: boolean;
  variationAxes: {
    [key: string]: { name: string; min: number; default: number; max: number };
  };
  namedVariations?: {
    [key: string]: { [key: string]: number };
  };
  ligatures: any;
};

const getLigatures = (font: fk.Font): string[] => {
  // @ts-ignore
  if (!font.GSUB) {
    return [];
  }

  // @ts-ignore
  const lookupLists = font.GSUB.lookupList.toArray();

  return lookupLists.reduce((acc0, lookupList) => {
    // Table Type 4 is ligature substitutions:
    // https://docs.microsoft.com/en-us/typography/opentype/spec/gsub#lookuptype-4-ligature-substitution-subtable
    if (lookupList.lookupType != 4) {
      return acc0;
    }

    const {
      coverage: { glyphs, rangeRecords },
      ligatureSets,
    } = lookupList.subTables[0];

    const leadingChars: string[] = rangeRecords
      ? rangeRecords.reduce(
          (acc1, { start, end }) => [
            ...acc1,
            ...Array.from(Array(end - start + 1), (_, x) => x + start).map(
              (i) => font.stringsForGlyph(i)[0]
            ),
          ],
          []
        )
      : glyphs.map((glyph) => {
          const result = font.stringsForGlyph(glyph);
          return result.join("");
        });

    return [
      ...acc0,
      ...ligatureSets.toArray().reduce(
        (acc2, ligatureSet, index) => [
          ...acc2,
          ...ligatureSet.reduce((acc3, ligature) => {
            const fullLigature =
              leadingChars[index] +
              ligature.components
                .map((x) => font.stringsForGlyph(x)[0])
                .join("");
            return [...acc3, fullLigature].filter(Boolean);
          }, []),
        ],
        []
      ),
    ];
  }, []);
};

export const getFontMetrics = (font: fk.Font): TFontMetrics => {
  // console.log(font);

  const os2 = font["OS/2"];

  let scripts = (font.GSUB ? font.GSUB.scriptList : []).concat(
    font.GPOS ? font.GPOS.scriptList : []
  );
  let scriptTags = Array.from(new Set(scripts.map((s: any) => s.tag)));
  let selectedScript = scripts[3];
  let languages = selectedScript ? selectedScript.script.langSysRecords : [];

  const ligatures = getLigatures(font);

  const metrics: TFontMetrics = {
    familyName: font.familyName,
    familySubName: font.subfamilyName,
    familyClass: os2.sFamilyClass,
    unitsPerEm: font.unitsPerEm,
    capHeight: font.capHeight,
    ascender: font.ascent,
    descender: font.descent,
    lineGap: font.lineGap,
    xHeight: font.xHeight,
    weightClass: os2.usWeightClass,
    widthClass: os2.usWidthClass,
    avgCharWidth: os2.xAvgCharWidth,
    italicAngle: font.italicAngle,
    underlinePosition: font.underlinePosition,
    underlineThickness: font.underlineThickness,
    scripts: scriptTags as string[],
    features: font.availableFeatures,
    variable: Object.keys(font.variationAxes).length === 0,
    variationAxes: font.variationAxes,
    namedVariations: font.namedVariations,
    ligatures: ligatures,
  };

  return metrics;
};

export const fromBlob = (blob: Blob): Promise<TFontMetrics> => {
  // const font = new Font();

  return new Promise((resolve, reject) => {
    blobToBuffer(blob, (error: Error, buffer: Buffer) => {
      if (error) {
        return reject(error);
      }

      try {
        const font = fk.create(buffer);
        setTimeout(() => {
          resolve(getFontMetrics(font));
        }, 0);
      } catch (e: unknown) {
        reject(e);
      }
    });
  });
};

export const fromUrl = (url: string): Promise<TFontMetrics> => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();

      const font = await fromBlob(blob);
      resolve(font);
    } catch (e) {
      reject(e);
    }
  });
};

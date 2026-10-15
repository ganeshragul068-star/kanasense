/**
 * Stroke Order Data for Japanese Kana Characters
 *
 * Coordinate system: 0–100 units (normalized), scaled to canvas at render time.
 * Each stroke is an ordered list of {x, y} waypoints.
 * Stroke order follows standard JIS/JLPT conventions: top→bottom, left→right.
 *
 * Coverage: 46 hiragana (あ-ん) + 46 katakana (ア-ン)
 */

export interface StrokePoint {
  x: number; // 0-100
  y: number; // 0-100
}

export interface StrokeDefinition {
  points: StrokePoint[];
  /** Human-readable direction hint */
  direction?: string;
}

export interface StrokeData {
  character: string;
  reading: string;
  totalStrokes: number;
  strokes: StrokeDefinition[];
}

/** All stroke order data keyed by character */
export const STROKE_ORDER_DATA: Record<string, StrokeData> = {
  // ============================================================
  // HIRAGANA
  // ============================================================

  // あ (a) — 3 strokes
  'あ': {
    character: 'あ', reading: 'a', totalStrokes: 3,
    strokes: [
      { points: [{ x: 20, y: 30 }, { x: 75, y: 30 }], direction: 'left-to-right' },
      { points: [{ x: 50, y: 18 }, { x: 50, y: 55 }, { x: 35, y: 70 }, { x: 20, y: 75 }], direction: 'top-to-bottom' },
      { points: [{ x: 60, y: 40 }, { x: 78, y: 55 }, { x: 80, y: 68 }, { x: 65, y: 80 }, { x: 45, y: 82 }, { x: 30, y: 75 }], direction: 'diagonal' },
    ],
  },

  // い (i) — 2 strokes
  'い': {
    character: 'い', reading: 'i', totalStrokes: 2,
    strokes: [
      { points: [{ x: 30, y: 25 }, { x: 28, y: 55 }, { x: 32, y: 75 }], direction: 'top-to-bottom' },
      { points: [{ x: 65, y: 20 }, { x: 62, y: 50 }, { x: 55, y: 70 }, { x: 40, y: 80 }], direction: 'top-to-bottom' },
    ],
  },

  // う (u) — 2 strokes
  'う': {
    character: 'う', reading: 'u', totalStrokes: 2,
    strokes: [
      { points: [{ x: 35, y: 22 }, { x: 55, y: 22 }], direction: 'left-to-right' },
      { points: [{ x: 45, y: 30 }, { x: 38, y: 50 }, { x: 40, y: 65 }, { x: 55, y: 75 }, { x: 68, y: 70 }, { x: 72, y: 55 }, { x: 65, y: 40 }], direction: 'top-to-bottom' },
    ],
  },

  // え (e) — 2 strokes
  'え': {
    character: 'え', reading: 'e', totalStrokes: 2,
    strokes: [
      { points: [{ x: 20, y: 35 }, { x: 80, y: 35 }], direction: 'left-to-right' },
      { points: [{ x: 50, y: 20 }, { x: 48, y: 50 }, { x: 35, y: 65 }, { x: 25, y: 78 }, { x: 45, y: 82 }, { x: 65, y: 75 }, { x: 78, y: 82 }], direction: 'top-to-bottom' },
    ],
  },

  // お (o) — 3 strokes
  'お': {
    character: 'お', reading: 'o', totalStrokes: 3,
    strokes: [
      { points: [{ x: 20, y: 30 }, { x: 75, y: 30 }], direction: 'left-to-right' },
      { points: [{ x: 45, y: 18 }, { x: 43, y: 55 }, { x: 35, y: 70 }, { x: 22, y: 78 }], direction: 'top-to-bottom' },
      { points: [{ x: 55, y: 45 }, { x: 70, y: 55 }, { x: 75, y: 68 }, { x: 65, y: 80 }, { x: 48, y: 82 }], direction: 'diagonal' },
    ],
  },

  // か (ka) — 3 strokes
  'か': {
    character: 'か', reading: 'ka', totalStrokes: 3,
    strokes: [
      { points: [{ x: 25, y: 20 }, { x: 25, y: 82 }], direction: 'top-to-bottom' },
      { points: [{ x: 22, y: 42 }, { x: 72, y: 42 }], direction: 'left-to-right' },
      { points: [{ x: 55, y: 30 }, { x: 72, y: 55 }, { x: 68, y: 72 }, { x: 55, y: 82 }], direction: 'diagonal' },
    ],
  },

  // き (ki) — 4 strokes
  'き': {
    character: 'き', reading: 'ki', totalStrokes: 4,
    strokes: [
      { points: [{ x: 20, y: 28 }, { x: 75, y: 28 }], direction: 'left-to-right' },
      { points: [{ x: 20, y: 48 }, { x: 75, y: 48 }], direction: 'left-to-right' },
      { points: [{ x: 48, y: 18 }, { x: 48, y: 58 }], direction: 'top-to-bottom' },
      { points: [{ x: 40, y: 62 }, { x: 55, y: 68 }, { x: 65, y: 78 }, { x: 58, y: 86 }, { x: 42, y: 85 }, { x: 28, y: 78 }], direction: 'diagonal' },
    ],
  },

  // く (ku) — 1 stroke
  'く': {
    character: 'く', reading: 'ku', totalStrokes: 1,
    strokes: [
      { points: [{ x: 72, y: 22 }, { x: 35, y: 50 }, { x: 72, y: 78 }], direction: 'diagonal' },
    ],
  },

  // け (ke) — 3 strokes
  'け': {
    character: 'け', reading: 'ke', totalStrokes: 3,
    strokes: [
      { points: [{ x: 25, y: 20 }, { x: 25, y: 80 }], direction: 'top-to-bottom' },
      { points: [{ x: 22, y: 40 }, { x: 70, y: 40 }, { x: 70, y: 62 }], direction: 'left-to-right' },
      { points: [{ x: 55, y: 50 }, { x: 72, y: 68 }, { x: 70, y: 80 }, { x: 55, y: 85 }], direction: 'diagonal' },
    ],
  },

  // こ (ko) — 2 strokes
  'こ': {
    character: 'こ', reading: 'ko', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 72, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 68 }, { x: 72, y: 68 }], direction: 'left-to-right' },
    ],
  },

  // さ (sa) — 3 strokes
  'さ': {
    character: 'さ', reading: 'sa', totalStrokes: 3,
    strokes: [
      { points: [{ x: 20, y: 32 }, { x: 75, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 48, y: 20 }, { x: 48, y: 52 }, { x: 40, y: 68 }, { x: 25, y: 78 }], direction: 'top-to-bottom' },
      { points: [{ x: 52, y: 55 }, { x: 68, y: 65 }, { x: 72, y: 78 }, { x: 60, y: 85 }, { x: 45, y: 82 }], direction: 'diagonal' },
    ],
  },

  // し (shi) — 1 stroke
  'し': {
    character: 'し', reading: 'shi', totalStrokes: 1,
    strokes: [
      { points: [{ x: 48, y: 18 }, { x: 48, y: 65 }, { x: 55, y: 78 }, { x: 68, y: 82 }], direction: 'top-to-bottom' },
    ],
  },

  // す (su) — 2 strokes
  'す': {
    character: 'す', reading: 'su', totalStrokes: 2,
    strokes: [
      { points: [{ x: 20, y: 35 }, { x: 78, y: 35 }, { x: 55, y: 45 }, { x: 48, y: 60 }, { x: 30, y: 72 }], direction: 'left-to-right' },
      { points: [{ x: 55, y: 62 }, { x: 68, y: 72 }, { x: 65, y: 82 }, { x: 52, y: 86 }], direction: 'diagonal' },
    ],
  },

  // せ (se) — 3 strokes
  'せ': {
    character: 'せ', reading: 'se', totalStrokes: 3,
    strokes: [
      { points: [{ x: 50, y: 18 }, { x: 50, y: 45 }], direction: 'top-to-bottom' },
      { points: [{ x: 18, y: 42 }, { x: 78, y: 42 }], direction: 'left-to-right' },
      { points: [{ x: 28, y: 55 }, { x: 28, y: 75 }, { x: 38, y: 82 }, { x: 55, y: 80 }, { x: 68, y: 72 }, { x: 72, y: 58 }], direction: 'top-to-bottom' },
    ],
  },

  // そ (so) — 2 strokes (historically 3, modern 2)
  'そ': {
    character: 'そ', reading: 'so', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 30 }, { x: 72, y: 30 }, { x: 50, y: 42 }, { x: 40, y: 55 }], direction: 'left-to-right' },
      { points: [{ x: 48, y: 52 }, { x: 62, y: 65 }, { x: 68, y: 78 }, { x: 55, y: 85 }, { x: 38, y: 82 }, { x: 28, y: 72 }], direction: 'diagonal' },
    ],
  },

  // た (ta) — 4 strokes
  'た': {
    character: 'た', reading: 'ta', totalStrokes: 4,
    strokes: [
      { points: [{ x: 20, y: 32 }, { x: 72, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 45, y: 20 }, { x: 45, y: 50 }], direction: 'top-to-bottom' },
      { points: [{ x: 22, y: 58 }, { x: 68, y: 58 }, { x: 55, y: 68 }, { x: 38, y: 80 }, { x: 25, y: 82 }], direction: 'left-to-right' },
      { points: [{ x: 62, y: 62 }, { x: 72, y: 75 }, { x: 68, y: 85 }], direction: 'diagonal' },
    ],
  },

  // ち (chi) — 2 strokes
  'ち': {
    character: 'ち', reading: 'chi', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 28 }, { x: 72, y: 28 }, { x: 55, y: 40 }, { x: 42, y: 55 }, { x: 28, y: 62 }], direction: 'left-to-right' },
      { points: [{ x: 52, y: 48 }, { x: 68, y: 62 }, { x: 72, y: 75 }, { x: 60, y: 84 }, { x: 42, y: 83 }, { x: 28, y: 74 }], direction: 'diagonal' },
    ],
  },

  // つ (tsu) — 1 stroke
  'つ': {
    character: 'つ', reading: 'tsu', totalStrokes: 1,
    strokes: [
      { points: [{ x: 68, y: 25 }, { x: 40, y: 35 }, { x: 25, y: 55 }, { x: 32, y: 72 }, { x: 52, y: 80 }, { x: 70, y: 72 }, { x: 78, y: 55 }], direction: 'diagonal' },
    ],
  },

  // て (te) — 1 stroke
  'て': {
    character: 'て', reading: 'te', totalStrokes: 1,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 72, y: 32 }, { x: 52, y: 42 }, { x: 45, y: 58 }, { x: 52, y: 72 }, { x: 68, y: 78 }, { x: 72, y: 68 }], direction: 'left-to-right' },
    ],
  },

  // と (to) — 2 strokes
  'と': {
    character: 'と', reading: 'to', totalStrokes: 2,
    strokes: [
      { points: [{ x: 45, y: 20 }, { x: 45, y: 62 }], direction: 'top-to-bottom' },
      { points: [{ x: 40, y: 55 }, { x: 58, y: 62 }, { x: 65, y: 75 }, { x: 55, y: 84 }, { x: 38, y: 82 }], direction: 'diagonal' },
    ],
  },

  // な (na) — 4 strokes
  'な': {
    character: 'な', reading: 'na', totalStrokes: 4,
    strokes: [
      { points: [{ x: 25, y: 32 }, { x: 68, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 42, y: 20 }, { x: 42, y: 50 }, { x: 32, y: 65 }, { x: 22, y: 72 }], direction: 'top-to-bottom' },
      { points: [{ x: 48, y: 45 }, { x: 62, y: 55 }, { x: 68, y: 68 }, { x: 58, y: 80 }, { x: 42, y: 82 }, { x: 28, y: 75 }], direction: 'diagonal' },
      { points: [{ x: 62, y: 48 }, { x: 75, y: 58 }, { x: 78, y: 70 }, { x: 70, y: 80 }], direction: 'diagonal' },
    ],
  },

  // に (ni) — 3 strokes
  'に': {
    character: 'に', reading: 'ni', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 62, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 35, y: 20 }, { x: 35, y: 72 }], direction: 'top-to-bottom' },
      { points: [{ x: 22, y: 72 }, { x: 70, y: 72 }, { x: 70, y: 55 }], direction: 'left-to-right' },
    ],
  },

  // ぬ (nu) — 2 strokes
  'ぬ': {
    character: 'ぬ', reading: 'nu', totalStrokes: 2,
    strokes: [
      { points: [{ x: 28, y: 22 }, { x: 28, y: 52 }, { x: 35, y: 65 }, { x: 50, y: 72 }, { x: 62, y: 65 }, { x: 65, y: 50 }, { x: 55, y: 38 }, { x: 40, y: 36 }], direction: 'top-to-bottom' },
      { points: [{ x: 58, y: 45 }, { x: 72, y: 58 }, { x: 78, y: 72 }, { x: 68, y: 82 }, { x: 52, y: 83 }], direction: 'diagonal' },
    ],
  },

  // ね (ne) — 2 strokes
  'ね': {
    character: 'ね', reading: 'ne', totalStrokes: 2,
    strokes: [
      { points: [{ x: 25, y: 22 }, { x: 25, y: 62 }, { x: 35, y: 72 }, { x: 50, y: 75 }, { x: 62, y: 68 }, { x: 65, y: 52 }, { x: 55, y: 42 }, { x: 40, y: 40 }], direction: 'top-to-bottom' },
      { points: [{ x: 58, y: 52 }, { x: 72, y: 62 }, { x: 75, y: 75 }, { x: 62, y: 84 }, { x: 48, y: 82 }, { x: 35, y: 75 }], direction: 'diagonal' },
    ],
  },

  // の (no) — 1 stroke
  'の': {
    character: 'の', reading: 'no', totalStrokes: 1,
    strokes: [
      { points: [{ x: 65, y: 25 }, { x: 42, y: 28 }, { x: 28, y: 45 }, { x: 30, y: 62 }, { x: 45, y: 75 }, { x: 62, y: 72 }, { x: 72, y: 58 }, { x: 68, y: 40 }, { x: 55, y: 32 }], direction: 'diagonal' },
    ],
  },

  // は (ha) — 3 strokes
  'は': {
    character: 'は', reading: 'ha', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 20 }, { x: 22, y: 80 }], direction: 'top-to-bottom' },
      { points: [{ x: 20, y: 42 }, { x: 62, y: 42 }], direction: 'left-to-right' },
      { points: [{ x: 52, y: 28 }, { x: 68, y: 45 }, { x: 72, y: 62 }, { x: 62, y: 78 }, { x: 45, y: 82 }], direction: 'diagonal' },
    ],
  },

  // ひ (hi) — 2 strokes
  'ひ': {
    character: 'ひ', reading: 'hi', totalStrokes: 2,
    strokes: [
      { points: [{ x: 30, y: 28 }, { x: 30, y: 75 }, { x: 42, y: 82 }], direction: 'top-to-bottom' },
      { points: [{ x: 55, y: 30 }, { x: 68, y: 45 }, { x: 72, y: 60 }, { x: 62, y: 76 }, { x: 45, y: 80 }, { x: 32, y: 74 }], direction: 'diagonal' },
    ],
  },

  // ふ (fu) — 4 strokes
  'ふ': {
    character: 'ふ', reading: 'fu', totalStrokes: 4,
    strokes: [
      { points: [{ x: 50, y: 18 }, { x: 50, y: 38 }], direction: 'top-to-bottom' },
      { points: [{ x: 22, y: 42 }, { x: 75, y: 42 }], direction: 'left-to-right' },
      { points: [{ x: 30, y: 55 }, { x: 22, y: 68 }, { x: 30, y: 80 }, { x: 48, y: 84 }], direction: 'diagonal' },
      { points: [{ x: 62, y: 55 }, { x: 75, y: 68 }, { x: 72, y: 80 }, { x: 58, y: 84 }], direction: 'diagonal' },
    ],
  },

  // へ (he) — 1 stroke
  'へ': {
    character: 'へ', reading: 'he', totalStrokes: 1,
    strokes: [
      { points: [{ x: 18, y: 55 }, { x: 48, y: 28 }, { x: 80, y: 55 }], direction: 'diagonal' },
    ],
  },

  // ほ (ho) — 4 strokes
  'ほ': {
    character: 'ほ', reading: 'ho', totalStrokes: 4,
    strokes: [
      { points: [{ x: 22, y: 20 }, { x: 22, y: 80 }], direction: 'top-to-bottom' },
      { points: [{ x: 20, y: 42 }, { x: 65, y: 42 }], direction: 'left-to-right' },
      { points: [{ x: 45, y: 30 }, { x: 45, y: 65 }], direction: 'top-to-bottom' },
      { points: [{ x: 42, y: 60 }, { x: 62, y: 68 }, { x: 68, y: 78 }, { x: 55, y: 85 }, { x: 38, y: 82 }], direction: 'diagonal' },
    ],
  },

  // ま (ma) — 3 strokes
  'ま': {
    character: 'ま', reading: 'ma', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 35 }, { x: 72, y: 35 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 55 }, { x: 72, y: 55 }], direction: 'left-to-right' },
      { points: [{ x: 48, y: 18 }, { x: 48, y: 62 }, { x: 38, y: 76 }, { x: 25, y: 82 }], direction: 'top-to-bottom' },
    ],
  },

  // み (mi) — 3 strokes
  'み': {
    character: 'み', reading: 'mi', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 28 }, { x: 55, y: 28 }, { x: 55, y: 50 }, { x: 42, y: 62 }], direction: 'left-to-right' },
      { points: [{ x: 28, y: 45 }, { x: 28, y: 80 }], direction: 'top-to-bottom' },
      { points: [{ x: 58, y: 38 }, { x: 72, y: 52 }, { x: 75, y: 68 }, { x: 62, y: 80 }, { x: 45, y: 82 }, { x: 32, y: 75 }], direction: 'diagonal' },
    ],
  },

  // む (mu) — 3 strokes
  'む': {
    character: 'む', reading: 'mu', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 38 }, { x: 62, y: 38 }, { x: 62, y: 58 }, { x: 48, y: 68 }, { x: 32, y: 65 }, { x: 25, y: 52 }], direction: 'left-to-right' },
      { points: [{ x: 45, y: 22 }, { x: 45, y: 42 }], direction: 'top-to-bottom' },
      { points: [{ x: 62, y: 55 }, { x: 75, y: 65 }, { x: 78, y: 78 }, { x: 65, y: 85 }, { x: 48, y: 83 }], direction: 'diagonal' },
    ],
  },

  // め (me) — 2 strokes
  'め': {
    character: 'め', reading: 'me', totalStrokes: 2,
    strokes: [
      { points: [{ x: 28, y: 25 }, { x: 28, y: 72 }], direction: 'top-to-bottom' },
      { points: [{ x: 52, y: 22 }, { x: 65, y: 38 }, { x: 68, y: 55 }, { x: 55, y: 68 }, { x: 38, y: 65 }, { x: 30, y: 55 }], direction: 'diagonal' },
    ],
  },

  // も (mo) — 3 strokes
  'も': {
    character: 'も', reading: 'mo', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 38 }, { x: 72, y: 38 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 55 }, { x: 72, y: 55 }], direction: 'left-to-right' },
      { points: [{ x: 47, y: 22 }, { x: 47, y: 62 }, { x: 38, y: 78 }, { x: 25, y: 84 }], direction: 'top-to-bottom' },
    ],
  },

  // や (ya) — 3 strokes
  'や': {
    character: 'や', reading: 'ya', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 35 }, { x: 48, y: 35 }, { x: 35, y: 55 }, { x: 22, y: 68 }, { x: 22, y: 80 }], direction: 'left-to-right' },
      { points: [{ x: 55, y: 22 }, { x: 55, y: 80 }], direction: 'top-to-bottom' },
      { points: [{ x: 52, y: 50 }, { x: 72, y: 38 }], direction: 'right-to-left' },
    ],
  },

  // ゆ (yu) — 2 strokes
  'ゆ': {
    character: 'ゆ', reading: 'yu', totalStrokes: 2,
    strokes: [
      { points: [{ x: 28, y: 28 }, { x: 28, y: 62 }, { x: 38, y: 72 }, { x: 52, y: 75 }, { x: 65, y: 68 }, { x: 70, y: 52 }, { x: 62, y: 38 }, { x: 48, y: 32 }], direction: 'top-to-bottom' },
      { points: [{ x: 52, y: 22 }, { x: 72, y: 22 }], direction: 'left-to-right' },
    ],
  },

  // よ (yo) — 3 strokes
  'よ': {
    character: 'よ', reading: 'yo', totalStrokes: 3,
    strokes: [
      { points: [{ x: 35, y: 32 }, { x: 72, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 52, y: 20 }, { x: 52, y: 60 }], direction: 'top-to-bottom' },
      { points: [{ x: 22, y: 60 }, { x: 72, y: 60 }, { x: 55, y: 72 }, { x: 40, y: 82 }, { x: 25, y: 84 }], direction: 'left-to-right' },
    ],
  },

  // ら (ra) — 2 strokes
  'ら': {
    character: 'ら', reading: 'ra', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 68, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 48, y: 22 }, { x: 48, y: 55 }, { x: 38, y: 70 }, { x: 28, y: 78 }, { x: 40, y: 84 }, { x: 58, y: 80 }, { x: 68, y: 70 }, { x: 70, y: 58 }], direction: 'top-to-bottom' },
    ],
  },

  // り (ri) — 2 strokes
  'り': {
    character: 'り', reading: 'ri', totalStrokes: 2,
    strokes: [
      { points: [{ x: 32, y: 25 }, { x: 32, y: 55 }, { x: 40, y: 68 }], direction: 'top-to-bottom' },
      { points: [{ x: 62, y: 22 }, { x: 62, y: 68 }, { x: 52, y: 80 }, { x: 40, y: 82 }], direction: 'top-to-bottom' },
    ],
  },

  // る (ru) — 1 stroke
  'る': {
    character: 'る', reading: 'ru', totalStrokes: 1,
    strokes: [
      { points: [{ x: 48, y: 18 }, { x: 35, y: 32 }, { x: 22, y: 50 }, { x: 32, y: 65 }, { x: 52, y: 72 }, { x: 68, y: 62 }, { x: 72, y: 45 }, { x: 58, y: 32 }, { x: 45, y: 45 }, { x: 42, y: 60 }], direction: 'diagonal' },
    ],
  },

  // れ (re) — 2 strokes
  'れ': {
    character: 'れ', reading: 're', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 22 }, { x: 22, y: 75 }], direction: 'top-to-bottom' },
      { points: [{ x: 20, y: 42 }, { x: 62, y: 42 }, { x: 55, y: 55 }, { x: 45, y: 68 }, { x: 55, y: 78 }, { x: 68, y: 72 }, { x: 72, y: 58 }], direction: 'left-to-right' },
    ],
  },

  // ろ (ro) — 1 stroke
  'ろ': {
    character: 'ろ', reading: 'ro', totalStrokes: 1,
    strokes: [
      { points: [{ x: 22, y: 35 }, { x: 72, y: 35 }, { x: 55, y: 48 }, { x: 40, y: 62 }, { x: 52, y: 72 }, { x: 68, y: 65 }, { x: 72, y: 50 }], direction: 'left-to-right' },
    ],
  },

  // わ (wa) — 2 strokes
  'わ': {
    character: 'わ', reading: 'wa', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 22 }, { x: 22, y: 80 }], direction: 'top-to-bottom' },
      { points: [{ x: 52, y: 22 }, { x: 62, y: 35 }, { x: 65, y: 50 }, { x: 55, y: 65 }, { x: 40, y: 72 }, { x: 28, y: 68 }], direction: 'diagonal' },
    ],
  },

  // を (wo) — 3 strokes
  'を': {
    character: 'を', reading: 'wo', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 72, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 48 }, { x: 72, y: 48 }], direction: 'left-to-right' },
      { points: [{ x: 48, y: 22 }, { x: 48, y: 55 }, { x: 38, y: 68 }, { x: 28, y: 78 }, { x: 42, y: 84 }, { x: 58, y: 80 }, { x: 68, y: 70 }, { x: 70, y: 56 }], direction: 'top-to-bottom' },
    ],
  },

  // ん (n) — 1 stroke
  'ん': {
    character: 'ん', reading: 'n', totalStrokes: 1,
    strokes: [
      { points: [{ x: 45, y: 25 }, { x: 38, y: 45 }, { x: 42, y: 60 }, { x: 55, y: 68 }, { x: 65, y: 60 }, { x: 62, y: 45 }, { x: 50, y: 35 }], direction: 'diagonal' },
    ],
  },

  // ============================================================
  // KATAKANA
  // ============================================================

  // ア (A) — 2 strokes
  'ア': {
    character: 'ア', reading: 'a', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 30 }, { x: 72, y: 30 }], direction: 'left-to-right' },
      { points: [{ x: 48, y: 18 }, { x: 40, y: 55 }, { x: 28, y: 80 }], direction: 'top-to-bottom' },
    ],
  },

  // イ (I) — 2 strokes
  'イ': {
    character: 'イ', reading: 'i', totalStrokes: 2,
    strokes: [
      { points: [{ x: 32, y: 22 }, { x: 52, y: 55 }], direction: 'diagonal' },
      { points: [{ x: 62, y: 18 }, { x: 62, y: 80 }], direction: 'top-to-bottom' },
    ],
  },

  // ウ (U) — 3 strokes
  'ウ': {
    character: 'ウ', reading: 'u', totalStrokes: 3,
    strokes: [
      { points: [{ x: 35, y: 22 }, { x: 58, y: 22 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 38 }, { x: 72, y: 38 }], direction: 'left-to-right' },
      { points: [{ x: 48, y: 38 }, { x: 45, y: 60 }, { x: 38, y: 78 }], direction: 'top-to-bottom' },
    ],
  },

  // エ (E) — 3 strokes
  'エ': {
    character: 'エ', reading: 'e', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 28 }, { x: 72, y: 28 }], direction: 'left-to-right' },
      { points: [{ x: 47, y: 28 }, { x: 47, y: 70 }], direction: 'top-to-bottom' },
      { points: [{ x: 22, y: 70 }, { x: 72, y: 70 }], direction: 'left-to-right' },
    ],
  },

  // オ (O) — 3 strokes
  'オ': {
    character: 'オ', reading: 'o', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 38 }, { x: 72, y: 38 }], direction: 'left-to-right' },
      { points: [{ x: 47, y: 18 }, { x: 47, y: 80 }], direction: 'top-to-bottom' },
      { points: [{ x: 55, y: 55 }, { x: 72, y: 68 }], direction: 'diagonal' },
    ],
  },

  // カ (KA) — 2 strokes
  'カ': {
    character: 'カ', reading: 'ka', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 35 }, { x: 68, y: 35 }, { x: 55, y: 52 }, { x: 38, y: 70 }, { x: 28, y: 80 }], direction: 'left-to-right' },
      { points: [{ x: 55, y: 22 }, { x: 55, y: 80 }], direction: 'top-to-bottom' },
    ],
  },

  // キ (KI) — 3 strokes
  'キ': {
    character: 'キ', reading: 'ki', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 30 }, { x: 72, y: 30 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 52 }, { x: 72, y: 52 }], direction: 'left-to-right' },
      { points: [{ x: 47, y: 18 }, { x: 47, y: 80 }], direction: 'top-to-bottom' },
    ],
  },

  // ク (KU) — 2 strokes
  'ク': {
    character: 'ク', reading: 'ku', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 65, y: 32 }, { x: 52, y: 50 }, { x: 35, y: 65 }], direction: 'left-to-right' },
      { points: [{ x: 58, y: 22 }, { x: 58, y: 75 }], direction: 'top-to-bottom' },
    ],
  },

  // ケ (KE) — 3 strokes
  'ケ': {
    character: 'ケ', reading: 'ke', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 35 }, { x: 65, y: 35 }], direction: 'left-to-right' },
      { points: [{ x: 42, y: 22 }, { x: 42, y: 68 }], direction: 'top-to-bottom' },
      { points: [{ x: 48, y: 55 }, { x: 68, y: 68 }, { x: 70, y: 80 }], direction: 'diagonal' },
    ],
  },

  // コ (KO) — 2 strokes
  'コ': {
    character: 'コ', reading: 'ko', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 28 }, { x: 70, y: 28 }, { x: 70, y: 70 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 70 }, { x: 70, y: 70 }], direction: 'left-to-right' },
    ],
  },

  // サ (SA) — 3 strokes
  'サ': {
    character: 'サ', reading: 'sa', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 52, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 52 }, { x: 52, y: 52 }], direction: 'left-to-right' },
      { points: [{ x: 38, y: 20 }, { x: 38, y: 60 }, { x: 28, y: 78 }], direction: 'top-to-bottom' },
    ],
  },

  // シ (SHI) — 3 strokes
  'シ': {
    character: 'シ', reading: 'shi', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 38 }, { x: 38, y: 32 }], direction: 'diagonal' },
      { points: [{ x: 22, y: 55 }, { x: 38, y: 50 }], direction: 'diagonal' },
      { points: [{ x: 55, y: 22 }, { x: 45, y: 52 }, { x: 35, y: 75 }], direction: 'diagonal' },
    ],
  },

  // ス (SU) — 2 strokes
  'ス': {
    character: 'ス', reading: 'su', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 72, y: 32 }, { x: 50, y: 48 }, { x: 32, y: 65 }], direction: 'left-to-right' },
      { points: [{ x: 52, y: 45 }, { x: 68, y: 62 }, { x: 65, y: 78 }], direction: 'diagonal' },
    ],
  },

  // セ (SE) — 3 strokes
  'セ': {
    character: 'セ', reading: 'se', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 65, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 42, y: 20 }, { x: 42, y: 55 }], direction: 'top-to-bottom' },
      { points: [{ x: 22, y: 70 }, { x: 72, y: 70 }, { x: 65, y: 55 }], direction: 'left-to-right' },
    ],
  },

  // ソ (SO) — 2 strokes
  'ソ': {
    character: 'ソ', reading: 'so', totalStrokes: 2,
    strokes: [
      { points: [{ x: 25, y: 28 }, { x: 38, y: 45 }], direction: 'diagonal' },
      { points: [{ x: 55, y: 22 }, { x: 45, y: 52 }, { x: 32, y: 75 }], direction: 'diagonal' },
    ],
  },

  // タ (TA) — 3 strokes
  'タ': {
    character: 'タ', reading: 'ta', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 30 }, { x: 68, y: 30 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 48 }, { x: 55, y: 48 }], direction: 'left-to-right' },
      { points: [{ x: 45, y: 22 }, { x: 35, y: 55 }, { x: 28, y: 75 }], direction: 'top-to-bottom' },
    ],
  },

  // チ (CHI) — 3 strokes
  'チ': {
    character: 'チ', reading: 'chi', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 30 }, { x: 72, y: 30 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 50 }, { x: 72, y: 50 }], direction: 'left-to-right' },
      { points: [{ x: 47, y: 38 }, { x: 42, y: 68 }, { x: 35, y: 80 }], direction: 'top-to-bottom' },
    ],
  },

  // ツ (TSU) — 3 strokes
  'ツ': {
    character: 'ツ', reading: 'tsu', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 35 }, { x: 32, y: 48 }], direction: 'diagonal' },
      { points: [{ x: 40, y: 28 }, { x: 50, y: 45 }], direction: 'diagonal' },
      { points: [{ x: 62, y: 22 }, { x: 52, y: 55 }, { x: 35, y: 75 }], direction: 'diagonal' },
    ],
  },

  // テ (TE) — 3 strokes
  'テ': {
    character: 'テ', reading: 'te', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 30 }, { x: 72, y: 30 }], direction: 'left-to-right' },
      { points: [{ x: 47, y: 18 }, { x: 47, y: 55 }], direction: 'top-to-bottom' },
      { points: [{ x: 22, y: 68 }, { x: 72, y: 68 }], direction: 'left-to-right' },
    ],
  },

  // ト (TO) — 2 strokes
  'ト': {
    character: 'ト', reading: 'to', totalStrokes: 2,
    strokes: [
      { points: [{ x: 38, y: 20 }, { x: 38, y: 80 }], direction: 'top-to-bottom' },
      { points: [{ x: 38, y: 45 }, { x: 65, y: 62 }], direction: 'diagonal' },
    ],
  },

  // ナ (NA) — 2 strokes
  'ナ': {
    character: 'ナ', reading: 'na', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 38 }, { x: 72, y: 38 }], direction: 'left-to-right' },
      { points: [{ x: 47, y: 22 }, { x: 47, y: 80 }], direction: 'top-to-bottom' },
    ],
  },

  // ニ (NI) — 2 strokes
  'ニ': {
    character: 'ニ', reading: 'ni', totalStrokes: 2,
    strokes: [
      { points: [{ x: 28, y: 35 }, { x: 65, y: 35 }], direction: 'left-to-right' },
      { points: [{ x: 18, y: 65 }, { x: 75, y: 65 }], direction: 'left-to-right' },
    ],
  },

  // ヌ (NU) — 2 strokes
  'ヌ': {
    character: 'ヌ', reading: 'nu', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 38 }, { x: 72, y: 38 }, { x: 48, y: 55 }, { x: 35, y: 72 }], direction: 'left-to-right' },
      { points: [{ x: 58, y: 22 }, { x: 48, y: 62 }, { x: 62, y: 78 }], direction: 'diagonal' },
    ],
  },

  // ネ (NE) — 4 strokes
  'ネ': {
    character: 'ネ', reading: 'ne', totalStrokes: 4,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 72, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 47, y: 20 }, { x: 47, y: 55 }], direction: 'top-to-bottom' },
      { points: [{ x: 30, y: 55 }, { x: 47, y: 65 }, { x: 62, y: 55 }], direction: 'diagonal' },
      { points: [{ x: 47, y: 65 }, { x: 35, y: 80 }], direction: 'diagonal' },
    ],
  },

  // ノ (NO) — 1 stroke
  'ノ': {
    character: 'ノ', reading: 'no', totalStrokes: 1,
    strokes: [
      { points: [{ x: 62, y: 20 }, { x: 38, y: 80 }], direction: 'diagonal' },
    ],
  },

  // ハ (HA) — 2 strokes
  'ハ': {
    character: 'ハ', reading: 'ha', totalStrokes: 2,
    strokes: [
      { points: [{ x: 38, y: 30 }, { x: 28, y: 78 }], direction: 'diagonal' },
      { points: [{ x: 55, y: 28 }, { x: 68, y: 78 }], direction: 'diagonal' },
    ],
  },

  // ヒ (HI) — 2 strokes
  'ヒ': {
    character: 'ヒ', reading: 'hi', totalStrokes: 2,
    strokes: [
      { points: [{ x: 25, y: 20 }, { x: 25, y: 78 }], direction: 'top-to-bottom' },
      { points: [{ x: 25, y: 52 }, { x: 68, y: 52 }, { x: 68, y: 78 }, { x: 25, y: 78 }], direction: 'left-to-right' },
    ],
  },

  // フ (FU) — 1 stroke
  'フ': {
    character: 'フ', reading: 'fu', totalStrokes: 1,
    strokes: [
      { points: [{ x: 22, y: 30 }, { x: 72, y: 30 }, { x: 45, y: 50 }, { x: 35, y: 75 }], direction: 'left-to-right' },
    ],
  },

  // ヘ (HE) — 1 stroke
  'ヘ': {
    character: 'ヘ', reading: 'he', totalStrokes: 1,
    strokes: [
      { points: [{ x: 18, y: 55 }, { x: 48, y: 25 }, { x: 80, y: 55 }], direction: 'diagonal' },
    ],
  },

  // ホ (HO) — 4 strokes
  'ホ': {
    character: 'ホ', reading: 'ho', totalStrokes: 4,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 72, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 47, y: 20 }, { x: 47, y: 80 }], direction: 'top-to-bottom' },
      { points: [{ x: 35, y: 62 }, { x: 22, y: 80 }], direction: 'diagonal' },
      { points: [{ x: 58, y: 62 }, { x: 72, y: 80 }], direction: 'diagonal' },
    ],
  },

  // マ (MA) — 2 strokes
  'マ': {
    character: 'マ', reading: 'ma', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 30 }, { x: 72, y: 30 }], direction: 'left-to-right' },
      { points: [{ x: 48, y: 30 }, { x: 35, y: 55 }, { x: 28, y: 75 }], direction: 'top-to-bottom' },
    ],
  },

  // ミ (MI) — 3 strokes
  'ミ': {
    character: 'ミ', reading: 'mi', totalStrokes: 3,
    strokes: [
      { points: [{ x: 30, y: 30 }, { x: 65, y: 30 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 50 }, { x: 72, y: 50 }], direction: 'left-to-right' },
      { points: [{ x: 30, y: 68 }, { x: 68, y: 68 }], direction: 'left-to-right' },
    ],
  },

  // ム (MU) — 2 strokes
  'ム': {
    character: 'ム', reading: 'mu', totalStrokes: 2,
    strokes: [
      { points: [{ x: 42, y: 22 }, { x: 28, y: 65 }, { x: 48, y: 80 }, { x: 68, y: 65 }, { x: 72, y: 42 }], direction: 'diagonal' },
      { points: [{ x: 22, y: 42 }, { x: 72, y: 42 }], direction: 'left-to-right' },
    ],
  },

  // メ (ME) — 2 strokes
  'メ': {
    character: 'メ', reading: 'me', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 38 }, { x: 72, y: 65 }], direction: 'diagonal' },
      { points: [{ x: 72, y: 28 }, { x: 42, y: 65 }], direction: 'diagonal' },
    ],
  },

  // モ (MO) — 3 strokes
  'モ': {
    character: 'モ', reading: 'mo', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 72, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 47, y: 20 }, { x: 47, y: 62 }], direction: 'top-to-bottom' },
      { points: [{ x: 22, y: 68 }, { x: 72, y: 68 }], direction: 'left-to-right' },
    ],
  },

  // ヤ (YA) — 3 strokes
  'ヤ': {
    character: 'ヤ', reading: 'ya', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 35 }, { x: 68, y: 35 }], direction: 'left-to-right' },
      { points: [{ x: 25, y: 20 }, { x: 38, y: 48 }], direction: 'diagonal' },
      { points: [{ x: 47, y: 22 }, { x: 47, y: 80 }], direction: 'top-to-bottom' },
    ],
  },

  // ユ (YU) — 3 strokes
  'ユ': {
    character: 'ユ', reading: 'yu', totalStrokes: 3,
    strokes: [
      { points: [{ x: 30, y: 28 }, { x: 68, y: 28 }, { x: 68, y: 65 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 65 }, { x: 72, y: 65 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 80 }, { x: 72, y: 80 }], direction: 'left-to-right' },
    ],
  },

  // ヨ (YO) — 3 strokes
  'ヨ': {
    character: 'ヨ', reading: 'yo', totalStrokes: 3,
    strokes: [
      { points: [{ x: 25, y: 25 }, { x: 70, y: 25 }, { x: 70, y: 50 }], direction: 'left-to-right' },
      { points: [{ x: 28, y: 50 }, { x: 70, y: 50 }, { x: 70, y: 75 }], direction: 'left-to-right' },
      { points: [{ x: 25, y: 75 }, { x: 70, y: 75 }], direction: 'left-to-right' },
    ],
  },

  // ラ (RA) — 2 strokes
  'ラ': {
    character: 'ラ', reading: 'ra', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 32 }, { x: 68, y: 32 }], direction: 'left-to-right' },
      { points: [{ x: 47, y: 20 }, { x: 42, y: 55 }, { x: 30, y: 75 }], direction: 'top-to-bottom' },
    ],
  },

  // リ (RI) — 2 strokes
  'リ': {
    character: 'リ', reading: 'ri', totalStrokes: 2,
    strokes: [
      { points: [{ x: 32, y: 22 }, { x: 32, y: 68 }], direction: 'top-to-bottom' },
      { points: [{ x: 58, y: 20 }, { x: 58, y: 68 }, { x: 48, y: 80 }], direction: 'top-to-bottom' },
    ],
  },

  // ル (RU) — 2 strokes
  'ル': {
    character: 'ル', reading: 'ru', totalStrokes: 2,
    strokes: [
      { points: [{ x: 28, y: 22 }, { x: 28, y: 68 }, { x: 40, y: 78 }], direction: 'top-to-bottom' },
      { points: [{ x: 55, y: 30 }, { x: 58, y: 58 }, { x: 68, y: 70 }, { x: 70, y: 80 }], direction: 'diagonal' },
    ],
  },

  // レ (RE) — 1 stroke
  'レ': {
    character: 'レ', reading: 're', totalStrokes: 1,
    strokes: [
      { points: [{ x: 30, y: 22 }, { x: 30, y: 68 }, { x: 65, y: 80 }], direction: 'top-to-bottom' },
    ],
  },

  // ロ (RO) — 3 strokes
  'ロ': {
    character: 'ロ', reading: 'ro', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 28 }, { x: 70, y: 28 }, { x: 70, y: 75 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 75 }, { x: 70, y: 75 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 28 }, { x: 22, y: 75 }], direction: 'top-to-bottom' },
    ],
  },

  // ワ (WA) — 2 strokes
  'ワ': {
    character: 'ワ', reading: 'wa', totalStrokes: 2,
    strokes: [
      { points: [{ x: 22, y: 28 }, { x: 72, y: 28 }, { x: 72, y: 75 }], direction: 'left-to-right' },
      { points: [{ x: 48, y: 35 }, { x: 40, y: 60 }, { x: 32, y: 75 }], direction: 'diagonal' },
    ],
  },

  // ヲ (WO) — 3 strokes
  'ヲ': {
    character: 'ヲ', reading: 'wo', totalStrokes: 3,
    strokes: [
      { points: [{ x: 22, y: 30 }, { x: 72, y: 30 }], direction: 'left-to-right' },
      { points: [{ x: 22, y: 48 }, { x: 72, y: 48 }], direction: 'left-to-right' },
      { points: [{ x: 48, y: 22 }, { x: 40, y: 62 }, { x: 30, y: 80 }], direction: 'top-to-bottom' },
    ],
  },

  // ン (N) — 2 strokes
  'ン': {
    character: 'ン', reading: 'n', totalStrokes: 2,
    strokes: [
      { points: [{ x: 25, y: 38 }, { x: 38, y: 52 }], direction: 'diagonal' },
      { points: [{ x: 62, y: 22 }, { x: 45, y: 65 }, { x: 32, y: 80 }], direction: 'diagonal' },
    ],
  },
};

/** Returns stroke data for a character, or null if not available */
export function getStrokeData(character: string): StrokeData | null {
  return STROKE_ORDER_DATA[character] ?? null;
}

/** Returns true if stroke order data exists for the given character */
export function hasStrokeData(character: string): boolean {
  return character in STROKE_ORDER_DATA;
}

/* ------------------------------------------------------------------ *
 *  2:1 dimetric isometric projection helpers for flat SVG plates.
 *  World axes: x → screen right+down, y → screen left+down, z → up.
 *  Everything returns SVG-ready coordinate strings so the components
 *  stay declarative.
 * ------------------------------------------------------------------ */
const S = 30 // px per world unit

export function project(x, y, z) {
  return [(x - y) * S, ((x + y) * 0.5 - z) * S]
}

const pts = (list) => list.map((p) => project(...p).join(',')).join(' ')

/* The three faces of an axis-aligned box that a top-down iso camera sees. */
export function boxFaces(x, y, z, w, d, h) {
  const z1 = z + h
  return {
    top: pts([
      [x, y, z1],
      [x + w, y, z1],
      [x + w, y + d, z1],
      [x, y + d, z1],
    ]),
    right: pts([
      [x + w, y, z],
      [x + w, y + d, z],
      [x + w, y + d, z1],
      [x + w, y, z1],
    ]),
    left: pts([
      [x, y + d, z],
      [x + w, y + d, z],
      [x + w, y + d, z1],
      [x, y + d, z1],
    ]),
  }
}

/* A rectangular patch on the +x face (window, panel…). */
export function rightPatch(x, y0, y1, z0, z1) {
  return pts([
    [x, y0, z0],
    [x, y1, z0],
    [x, y1, z1],
    [x, y0, z1],
  ])
}

/* A rectangular patch on the +y face. */
export function leftPatch(y, x0, x1, z0, z1) {
  return pts([
    [x0, y, z0],
    [x1, y, z0],
    [x1, y, z1],
    [x0, y, z1],
  ])
}

/* A segment lying on the top plane at height z (for engraved lines). */
export function topLine(z, x0, y0, x1, y1) {
  const a = project(x0, y0, z)
  const b = project(x1, y1, z)
  return { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }
}

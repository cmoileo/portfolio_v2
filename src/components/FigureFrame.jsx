/**
 * Editorial "plate" chrome shared by both project figures: a hairline
 * border, four corner crop marks, a faint measurement grid and a mono
 * caption. Rendered as SVG children so it lives inside each figure's own
 * <svg> and scales with it. `tone` flips the palette for light vs dark
 * sections; colours come through currentColor-friendly rgba so one
 * component serves both.
 */
export default function FigureFrame({ w, h, index, caption, tone = 'light' }) {
  const line = tone === 'dark' ? 'rgba(250,250,250,0.22)' : 'rgba(17,17,17,0.28)'
  const faint = tone === 'dark' ? 'rgba(250,250,250,0.06)' : 'rgba(17,17,17,0.06)'
  const text = tone === 'dark' ? 'rgba(250,250,250,0.6)' : 'rgba(17,17,17,0.55)'
  const m = 18 // inset of the frame from the svg edge
  const t = 13 // crop-mark tick length

  const corner = (cx, cy, sx, sy, key) => (
    <g key={key} stroke={line} strokeWidth="1.4" fill="none">
      <line x1={cx} y1={cy} x2={cx + sx * t} y2={cy} />
      <line x1={cx} y1={cy} x2={cx} y2={cy + sy * t} />
    </g>
  )

  const cols = 6
  const rows = 7
  const gridLines = []
  for (let i = 1; i < cols; i++) {
    const x = m + ((w - 2 * m) * i) / cols
    gridLines.push(<line key={`v${i}`} x1={x} y1={m} x2={x} y2={h - m} />)
  }
  for (let i = 1; i < rows; i++) {
    const y = m + ((h - 2 * m) * i) / rows
    gridLines.push(<line key={`h${i}`} x1={m} y1={y} x2={w - m} y2={y} />)
  }

  return (
    <g className="fig-frame">
      <g stroke={faint} strokeWidth="1">
        {gridLines}
      </g>

      <rect
        x={m}
        y={m}
        width={w - 2 * m}
        height={h - 2 * m}
        fill="none"
        stroke={line}
        strokeWidth="1.2"
      />

      {corner(m, m, 1, 1, 'tl')}
      {corner(w - m, m, -1, 1, 'tr')}
      {corner(m, h - m, 1, -1, 'bl')}
      {corner(w - m, h - m, -1, -1, 'br')}

      <text
        x={m}
        y={m - 8}
        fill={text}
        fontFamily='"Geist Mono", monospace'
        fontSize="11"
        letterSpacing="1.6"
      >
        FIG. {index}
      </text>
      <text
        x={w - m}
        y={h - m + 18}
        fill={text}
        textAnchor="end"
        fontFamily='"Geist Mono", monospace'
        fontSize="11"
        letterSpacing="1.6"
      >
        {caption}
      </text>
    </g>
  )
}

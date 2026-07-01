import { useEffect, useRef } from 'react'

/**
 * Fixed SVG-noise grain over the whole page. Animated by nudging the
 * background-position a few px each frame so the grain "boils" subtly
 * instead of sitting static. pointer-events:none, mix-blend:overlay.
 */
export default function GrainOverlay() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el) return
    let raf = 0
    let frame = 0
    const steps = [
      [0, 0],
      [-12, 8],
      [6, -14],
      [-8, -6],
      [10, 10],
      [-6, 12],
    ]
    const loop = () => {
      // Throttle to ~12fps — grain doesn't need 60fps and it saves paint.
      if (frame % 5 === 0) {
        const [x, y] = steps[(frame / 5 | 0) % steps.length]
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
      frame++
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <div ref={ref} className="grain" aria-hidden="true" />
}

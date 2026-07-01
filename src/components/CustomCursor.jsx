import { useEffect, useRef } from 'react'

/**
 * Two-part cursor: an 8px accent dot that tracks the pointer 1:1, and a ring
 * that follows with lerp lag. Over interactive elements the ring expands and
 * switches to mix-blend-mode:difference. Pure rAF — no React re-renders.
 */
export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...mouse }
    let visible = false
    let pressed = false
    let raf = 0

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (!visible) {
        visible = true
        dot.style.opacity = '1'
      }
    }

    const isInteractive = (el) =>
      el &&
      (el.closest('a, button, [data-cursor="hover"], input, textarea, [role="button"]') !==
        null)

    const onOver = (e) => {
      ring.classList.toggle('is-hover', isInteractive(e.target))
    }

    const onDown = () => {
      pressed = true
    }
    const onUp = () => {
      pressed = false
    }

    const onLeave = () => {
      dot.style.opacity = '0'
      ring.style.opacity = '0'
      visible = false
    }

    const loop = () => {
      const dotScale = pressed ? 0.5 : 1
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) scale(${dotScale})`

      ringPos.x += (mouse.x - ringPos.x) * 0.18
      ringPos.y += (mouse.y - ringPos.y) * 0.18
      const ringScale = pressed ? 0.82 : 1
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) scale(${ringScale})`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" style={{ opacity: 0 }} />
    </>
  )
}

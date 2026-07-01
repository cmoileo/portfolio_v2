import { useCallback, useEffect, useRef, useState } from 'react'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#__01:;.×'

/**
 * Cold "terminal decode" scramble. Characters resolve left→right while the
 * unresolved ones cycle through random glyphs. Used by the hero entry reveal
 * and by the contact e-mail on hover (same effect as the loader).
 *
 * @param {string} finalText  the text the scramble settles on
 * @param {object} opts
 * @param {number} opts.duration   seconds for the whole reveal
 * @param {boolean} opts.autoStart run once on mount
 */
export function useTextScramble(finalText, { duration = 0.5, autoStart = false } = {}) {
  const [display, setDisplay] = useState(autoStart ? '' : finalText)
  const rafRef = useRef(0)
  const text = finalText ?? ''

  const scramble = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    const total = Math.max(duration, 0.01) * 1000
    const start = performance.now()
    const len = text.length

    const tick = (now) => {
      const p = Math.min((now - start) / total, 1)
      let out = ''
      for (let i = 0; i < len; i++) {
        const ch = text[i]
        if (ch === ' ' || ch === ' ') {
          out += ch
          continue
        }
        // Each character locks in once progress passes its threshold.
        const threshold = (i / Math.max(len, 1)) * 0.7
        if (p >= threshold + 0.15 || p >= 1) {
          out += ch
        } else if (p >= threshold) {
          out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
        } else {
          out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
      }
      setDisplay(out)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(text)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [text, duration])

  useEffect(() => {
    if (autoStart) scramble()
    return () => cancelAnimationFrame(rafRef.current)
  }, [autoStart, scramble])

  return [display, scramble]
}

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// LinkedIn vanity id — swap for the real slug if it ever changes.
const LINKEDIN_ID = 'leo-fezard'
const MESSAGE = `Loading employee [${LINKEDIN_ID}] portfolio...`

const TOTAL_MS = 2500
const FLASH_MS = 360

/**
 * Cold terminal loader. Types the boot line out, holds with a blinking accent
 * cursor, then performs a hard white-flash cut into the hero (no crossfade).
 */
export default function Loader({ onComplete }) {
  const [typed, setTyped] = useState('')
  const [flash, setFlash] = useState(false)
  const barRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let typeTimer
    let i = 0

    const type = () => {
      i += 1
      setTyped(MESSAGE.slice(0, i))
      if (i < MESSAGE.length) typeTimer = setTimeout(type, 26)
    }
    if (reduce) {
      setTyped(MESSAGE)
    } else {
      typeTimer = setTimeout(type, 280)
    }

    const flashTimer = setTimeout(() => setFlash(true), TOTAL_MS)
    const doneTimer = setTimeout(() => onComplete?.(), TOTAL_MS + FLASH_MS)

    return () => {
      clearTimeout(typeTimer)
      clearTimeout(flashTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <motion.div
      className="loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
    >
      <div className="loader__line">
        <span>{typed}</span>
        <span className="blink" />
      </div>

      <div className="loader__bar" aria-hidden="true">
        <motion.i
          ref={barRef}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: TOTAL_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="loader__meta">SYS · v2.0 — booting render pipeline</div>

      {flash && (
        <motion.div
          className="loader__flash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: FLASH_MS / 1000, ease: 'easeOut', delay: 0.04 }}
        />
      )}
    </motion.div>
  )
}

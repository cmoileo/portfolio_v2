import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const smoothstep = (t) => t * t * (3 - 2 * t)

/**
 * The gap between "Inkgora" (closing a chapter about books) and "About"
 * is staged as a literal page turn: the closing page's corner lifts and
 * folds away, tearing a hole that reveals a teaser of the next chapter
 * underneath before it unpins into the real Personal section.
 *
 * The vmax-driven fold geometry reads as a corner on wide viewports but
 * turns into a spike on tall narrow ones, so phones get a static, unpinned
 * two-slab divider instead — consistent with the hero's own desktop/mobile
 * split.
 */
export default function ChapterBreak() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  )

  const wrapRef = useRef(null)
  const pageRef = useRef(null)
  const foldRef = useRef(null)
  const foldTagRef = useRef(null)
  const underRef = useRef(null)

  useLayoutEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setIsMobile(mq.matches)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useLayoutEffect(() => {
    if (isMobile) return
    let st
    const ctx = gsap.context(() => {
      st = ScrollTrigger.create({
        trigger: wrapRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          let t
          if (p < 0.08) t = 0
          else if (p > 0.82) t = 1
          else t = (p - 0.08) / 0.74
          t = smoothstep(t)

          const cut = t * 170 // vmax — comfortably larger than any viewport diagonal
          if (pageRef.current) {
            pageRef.current.style.clipPath = `polygon(0 0, 100% 0, 100% calc(100% - ${cut}vmax), calc(100% - ${cut}vmax) 100%, 0 100%)`
            pageRef.current.style.opacity = t > 0.9 ? 1 - (t - 0.9) / 0.1 : 1
          }
          if (foldRef.current) {
            // The flap only needs to read as a corner lifting — sized and
            // faded independently of `cut` so it never grows into a wall
            // that blankets the reveal underneath.
            const foldGrow = smoothstep(Math.min(1, t / 0.45))
            const foldSize = foldGrow * 62 // vmax
            foldRef.current.style.width = `${foldSize}vmax`
            foldRef.current.style.height = `${foldSize}vmax`
            foldRef.current.style.transform = `translate(${t * 42}vmax, ${-t * 48}vmax) rotate(${-48 * t}deg) scale(${1 + t * 0.1})`
            foldRef.current.style.opacity = t > 0.5 ? Math.max(0, 1 - (t - 0.5) / 0.3) : 1
          }
          if (foldTagRef.current) {
            foldTagRef.current.style.opacity = t > 0.12 && t < 0.45 ? 1 : 0
          }
          if (underRef.current) {
            const rt = Math.max(0, (t - 0.2) / 0.8)
            underRef.current.style.opacity = String(rt)
            underRef.current.style.filter = `blur(${(1 - rt) * 14}px)`
            underRef.current.style.transform = `translateY(${(1 - rt) * 26}px) scale(${0.96 + rt * 0.04})`
          }
        },
      })
    }, wrapRef)
    ScrollTrigger.refresh()
    return () => {
      st?.kill()
      ctx.revert()
    }
  }, [isMobile])

  if (isMobile) {
    return (
      <div className="chapter-break chapter-break--static">
        <div className="chapter-break__slab chapter-break__slab--light">
          <span className="chapter-break__tag">— 02 / Inkgora</span>
          <span className="chapter-break__numeral chapter-break__numeral--static">02</span>
          <span className="chapter-break__endnote">end of chapter.</span>
        </div>
        <div className="chapter-break__slab chapter-break__slab--dark">
          <span className="chapter-break__tag">— 03 / About</span>
          <h3 className="chapter-break__title">
            Still <span className="accent">over-thinking.</span>
          </h3>
        </div>
      </div>
    )
  }

  return (
    <div className="chapter-break" ref={wrapRef}>
      <div className="chapter-break__sticky">
        {/* underlayer — teaser for the next chapter, revealed through the tear */}
        <div className="chapter-break__under" ref={underRef}>
          <span className="chapter-break__tag">— 03 / About</span>
          <h3 className="chapter-break__title">
            Still
            <br />
            <span className="accent">over-thinking.</span>
          </h3>
        </div>

        {/* the closing page of chapter 02, peeling away */}
        <div className="chapter-break__page" ref={pageRef}>
          <span className="chapter-break__tag chapter-break__tag--page">
            — 02 / Inkgora
          </span>
          <span className="chapter-break__numeral">02</span>
          <span className="chapter-break__endnote">end of chapter.</span>
        </div>

        {/* the corner lifting off the page */}
        <div className="chapter-break__fold" ref={foldRef}>
          <span className="chapter-break__fold-tag" ref={foldTagRef}>
            turn →
          </span>
        </div>
      </div>
    </div>
  )
}

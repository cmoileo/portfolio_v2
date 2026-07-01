import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTextScramble } from '../hooks/useTextScramble.js'

gsap.registerPlugin(ScrollTrigger)

const EMAIL = 'leo.fezard33@gmail.com'

const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/leo-fezard/' },
  { label: 'GitHub', href: 'https://github.com/' },
  { label: 'CV', href: '/cv.pdf' },
]

export default function Contact() {
  const root = useRef(null)
  const [email, scrambleEmail] = useTextScramble(EMAIL, { duration: 0.6 })

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact__reveal', {
        y: 40,
        opacity: 0,
        ease: 'expo.out',
        duration: 1.1,
        stagger: 0.14,
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section section--dark" style={{ minHeight: '100svh' }}>
      <div
        className="shell flex flex-col items-center justify-center text-center"
        style={{ minHeight: '100svh', gap: 'clamp(28px, 5vh, 56px)' }}
      >
        <span className="contact__avail contact__reveal">— available for work</span>

        <h2 className="contact__title contact__reveal">
          Say hi.
          <span className="blink" />
        </h2>

        <a
          className="contact__email contact__reveal"
          href={`mailto:${EMAIL}`}
          data-cursor="hover"
          onMouseEnter={scrambleEmail}
        >
          {email}
        </a>

        <div className="contact__links contact__reveal flex" style={{ gap: 'clamp(20px, 4vw, 56px)' }}>
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" data-cursor="hover">
              {l.label}
            </a>
          ))}
        </div>

        <div
          className="contact__footer contact__reveal"
          style={{ marginTop: 'clamp(40px, 8vh, 96px)' }}
        >
          © {new Date().getFullYear()} Léo Fezard — So called “Software engineer”
        </div>
      </div>
    </section>
  )
}

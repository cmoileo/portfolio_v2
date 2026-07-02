import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = "leo.fezard33@gmail.com";

/**
 * Persistent chrome that fades in once the hero has dissolved: a hairline
 * red reading-progress bar hugging the top edge, and a minimal identity
 * bar (name / say hi). The bar sits in mix-blend-mode: difference so the
 * same markup reads ink-on-paper and paper-on-ink as sections alternate.
 */
export default function SiteChrome() {
  const barRef = useRef(null);
  const headRef = useRef(null);

  useLayoutEffect(() => {
    const bar = barRef.current;
    const head = headRef.current;
    let shown = false;

    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => {
        if (bar) bar.style.transform = `scaleX(${self.progress})`;

        // Reveal once the hero hand-off is done (or right away on the
        // static mobile hero, which is a single viewport tall).
        const hero = document.querySelector(".hero");
        const threshold = hero
          ? (hero.offsetHeight - window.innerHeight) * 0.82
          : window.innerHeight * 0.6;
        const next = self.scroll() > threshold;
        if (next !== shown && head) {
          shown = next;
          head.classList.toggle("is-visible", next);
        }
      },
    });
    return () => st.kill();
  }, []);

  return (
    <>
      <div ref={barRef} className="progress-bar" aria-hidden="true" />
      <header ref={headRef} className="site-head">
        <span className="site-head__name">Léo Fezard</span>
        <a className="site-head__cta" href={`mailto:${EMAIL}`} data-cursor="hover">
          Say hi ↗
        </a>
      </header>
    </>
  );
}

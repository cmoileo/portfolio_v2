import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = "leo.fezard33@gmail.com";

/**
 * Persistent chrome revealed once the hero has dissolved.
 *
 * The reading progress is drawn as a red line that traces the viewport
 * frame: it starts at the top-left corner, runs along the top edge, down
 * the right side, back along the bottom and up the left — closing the
 * rectangle exactly at 100% scroll. It replaces both the old top bar and
 * the native scrollbar. A minimal identity bar (name / say hi) fades in
 * alongside, in mix-blend-mode: difference so it reads on any section.
 */
export default function SiteChrome() {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const progress = useRef(0);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    const head = headRef.current;
    let shown = false;

    const draw = () => {
      const len = path.getTotalLength();
      // clamp so a hair of the line is always visible once scrolling starts
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len * (1 - progress.current)}`;
    };

    const layout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const i = 1.25; // half the stroke width, keeps the line inside the edge
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      // clockwise from top-left: top → right → bottom → left, closed
      path.setAttribute(
        "d",
        `M ${i} ${i} L ${w - i} ${i} L ${w - i} ${h - i} L ${i} ${h - i} Z`,
      );
      draw();
    };

    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => {
        progress.current = self.progress;
        draw();

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
      onRefresh: layout,
    });

    layout();
    window.addEventListener("resize", layout);
    return () => {
      st.kill();
      window.removeEventListener("resize", layout);
    };
  }, []);

  return (
    <>
      <svg
        ref={svgRef}
        className="progress-frame"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path ref={pathRef} />
      </svg>

      <header ref={headRef} className="site-head">
        <span className="site-head__name">Léo Fezard</span>
        <a
          className="site-head__cta"
          href={`mailto:${EMAIL}`}
          data-cursor="hover"
        >
          Say hi ↗
        </a>
      </header>
    </>
  );
}

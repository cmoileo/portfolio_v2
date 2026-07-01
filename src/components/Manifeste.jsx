import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LINES = [
  { text: "“I don’t write code." },
  { text: "I materialize a vision" },
  { text: "of the world.”" },
];

export default function Manifeste() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".manifeste__line .reveal-line", {
        yPercent: 115,
        ease: "expo.out",
        duration: 1.1,
        stagger: 0.15,
        scrollTrigger: {
          trigger: root.current,
          start: "top 72%",
        },
      });
      gsap.from(".manifeste__foot > *", {
        y: 24,
        opacity: 0,
        ease: "power3.out",
        duration: 0.9,
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".manifeste__foot",
          start: "top 88%",
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="section section--light">
      <div className="shell">
        <div
          className="flex flex-col"
          style={{ gap: "clamp(4px, 0.4vw, 8px)" }}
        >
          {LINES.map((l, i) => (
            <span key={i} className="manifeste__line reveal-mask">
              <span className="reveal-line">{l.text}</span>
            </span>
          ))}
        </div>

        <div
          className="manifeste__foot foot-grid"
          style={{ marginTop: "clamp(56px, 9vh, 140px)" }}
        >
          <span className="manifeste__foot-label">— philosophy</span>
          <p className="manifeste__foot-body">
            Code doesn’t matter. It is neither useful nor pointless. Only
            purpose does. I build for humans. Not for the spreadsheet.
          </p>
        </div>
      </div>
    </section>
  );
}

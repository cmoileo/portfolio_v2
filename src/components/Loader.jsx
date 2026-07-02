import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const LINKEDIN_ID = "leo-fezard";
const MESSAGE = `Registering plate [${LINKEDIN_ID}]`;

const COUNT_MS = 2150; // 0 → 100
const HOLD_MS = 320; // registered mark held before the curtain lifts
const WIPE_MS = 750; // curtain travel

const STEPS = 5; // discrete registration snaps
const MAX_OFF = 26; // px of misregistration at step 0

const easeInOutQuart = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

/**
 * Letterpress loader. The site's typographic mark — the Ultra open-quote —
 * is stamped onto the ink ground with its red and paper plates out of
 * register. As the counter runs, the plates snap closer step by step and
 * land perfectly registered at 100%. The whole surface then lifts like a
 * curtain onto the paper hero, whose grain materialization takes over.
 */
export default function Loader({ onComplete }) {
  const [count, setCount] = useState(0);
  const [typed, setTyped] = useState("");
  const [wiping, setWiping] = useState(false);
  const reduce = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  ).current;

  useEffect(() => {
    let raf;
    let typeTimer;
    const timers = [];

    if (reduce) {
      setTyped(MESSAGE);
      setCount(100);
      timers.push(setTimeout(() => onComplete?.(), 700));
      return () => timers.forEach(clearTimeout);
    }

    let i = 0;
    const type = () => {
      i += 1;
      setTyped(MESSAGE.slice(0, i));
      if (i < MESSAGE.length) typeTimer = setTimeout(type, 24);
    };
    typeTimer = setTimeout(type, 240);

    // Hybrid clock: rAF while the tab is visible, a timeout fallback while
    // it's hidden (browsers pause rAF entirely in background tabs — the
    // loader must still finish if the site was opened behind another tab).
    const t0 = performance.now();
    let fallback;
    const tick = () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      const p = Math.min(1, (performance.now() - t0) / COUNT_MS);
      setCount(Math.round(easeInOutQuart(p) * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
        fallback = setTimeout(tick, 160);
      } else {
        timers.push(setTimeout(() => setWiping(true), HOLD_MS));
        timers.push(setTimeout(() => onComplete?.(), HOLD_MS + WIPE_MS));
      }
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      clearTimeout(typeTimer);
      timers.forEach(clearTimeout);
    };
  }, [onComplete, reduce]);

  // Quantized registration: offsets shrink in discrete snaps, not a glide.
  const step = Math.min(STEPS, Math.floor((count / 100) * STEPS + 1e-6));
  const off = MAX_OFF * (1 - step / STEPS);
  const registered = step >= STEPS;

  return (
    <motion.div
      className={`loader${wiping ? " is-wiping" : ""}`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
    >
      <div className="loader__inner">
        {/* plate crop marks, same vocabulary as the figures and the CV */}
        <i className="loader__crop tl" />
        <i className="loader__crop tr" />
        <i className="loader__crop bl" />
        <i className="loader__crop br" />

        {/* the mark being stamped into register */}
        <div className="loader__mark" key={step} aria-hidden="true">
          <span
            className="loader__mark-plate loader__mark-plate--paper"
            style={{ transform: `translate(${-off}px, ${off * 0.7}px)` }}
          >
            “
          </span>
          <span
            className="loader__mark-plate loader__mark-plate--red"
            style={{ transform: `translate(${off}px, ${-off * 0.7}px)` }}
          >
            “
          </span>
        </div>

        <div className="loader__line">
          <span>{typed}</span>
          <span className="blink" />
        </div>

        <div
          className={`loader__count${registered ? " is-registered" : ""}`}
          aria-hidden="true"
        >
          {String(count).padStart(3, "0")}
        </div>

        <div className="loader__meta">
          PRESS · v2.0 — {registered ? "in register" : "registering plates"}
        </div>
      </div>
    </motion.div>
  );
}

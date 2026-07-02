import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PHRASE = "Available for work — Say hi — ";

/**
 * Red kinetic band bridging About and Contact. The track drifts on its
 * own and picks up speed + a slight italic skew from scroll velocity —
 * the tunnel's kinetic-typography spirit, kept readable. Two identical
 * halves let the translation wrap seamlessly at -50%.
 */
export default function Marquee() {
  const trackRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const track = trackRef.current;
    let x = 0;
    let vel = 0;

    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => {
        vel = self.getVelocity();
      },
    });

    const tick = (_, deltaMs) => {
      const dt = Math.min(deltaMs, 50) / 1000;
      vel *= 0.92;
      const boost = Math.min(Math.abs(vel) / 900, 6);
      x -= (4.2 + boost * 4.2) * dt;
      if (x <= -50) x += 50;
      const skew = gsap.utils.clamp(-9, 9, vel / 260);
      track.style.transform = `translateX(${x}%) skewX(${-skew}deg)`;
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, []);

  const half = Array.from({ length: 4 }, (_, i) => (
    <span key={i}>{PHRASE}</span>
  ));

  return (
    <aside className="marquee" aria-label="Available for work — say hi">
      <div ref={trackRef} className="marquee__track">
        <div className="marquee__half" aria-hidden="true">
          {half}
        </div>
        <div className="marquee__half" aria-hidden="true">
          {half}
        </div>
      </div>
    </aside>
  );
}

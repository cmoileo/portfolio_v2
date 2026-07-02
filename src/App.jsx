import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Loader from "./components/Loader.jsx";
import GrainOverlay from "./components/GrainOverlay.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import LiquidHero from "./components/LiquidHero.jsx";
import SiteChrome from "./components/SiteChrome.jsx";

// Below-the-fold sections are split into their own chunks.
const Manifeste = lazy(() => import("./components/Manifeste.jsx"));
const ProjectMobilistud = lazy(
  () => import("./components/ProjectMobilistud.jsx"),
);
const ProjectInkgora = lazy(() => import("./components/ProjectInkgora.jsx"));
const ChapterBreak = lazy(() => import("./components/ChapterBreak.jsx"));
const Personal = lazy(() => import("./components/Personal.jsx"));
const Contact = lazy(() => import("./components/Contact.jsx"));

gsap.registerPlugin(ScrollTrigger);

/* Static text hero used on phones (3D tunnel disabled). */
function MobileHero() {
  return (
    <section className="hero-mobile">
      <div className="hero-mobile__tiles" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i}>So called “Software engineer” So called</div>
        ))}
      </div>
      <span className="hero-mobile__name">Léo Fezard</span>
      <h1 className="hero-mobile__title">
        <span className="block l1">So called</span>
        <span className="block l2">“Software engineer”</span>
      </h1>
    </section>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const lenisRef = useRef(null);
  const heroRef = useRef(null);
  const heroProgress = useRef(0);
  const hintRef = useRef(null);

  /* ---- viewport class (mobile disables the tunnel) ---- */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* ---- Lenis smooth scroll wired into the GSAP ticker ---- */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    if (import.meta.env.DEV) window.__lenis = lenis;
    lenis.stop(); // locked until the loader finishes

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  /* ---- release scroll + refresh once the loader is gone ---- */
  useEffect(() => {
    if (loading) return;
    const lenis = lenisRef.current;
    lenis?.scrollTo(0, { immediate: true });
    lenis?.start();
    // Re-measure after fonts / lazy chunks / layout settle.
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 120);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 700);
    window.addEventListener("load", ScrollTrigger.refresh);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("load", ScrollTrigger.refresh);
    };
  }, [loading]);

  /* ---- hero scroll driver (camera Z + overlay reveal) ---- */
  useLayoutEffect(() => {
    if (loading || isMobile) return;
    let st;
    const ctx = gsap.context(() => {
      st = ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          heroProgress.current = p;
          if (hintRef.current) {
            hintRef.current.style.opacity = p < 0.1 ? "1" : "0";
          }
        },
      });
    });
    ScrollTrigger.refresh();
    return () => {
      st?.kill();
      ctx.revert();
    };
  }, [loading, isMobile]);

  return (
    <>
      <GrainOverlay />
      <CustomCursor />

      <AnimatePresence>
        {loading && (
          <Loader key="loader" onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      <main>
        {isMobile ? (
          <MobileHero />
        ) : (
          <section className="hero" ref={heroRef}>
            <div className="hero__sticky">
              <LiquidHero progressRef={heroProgress} started={!loading} />
              <div className="hero-chrome" aria-hidden="true">
                <span className="hero-chrome__tl">Portfolio</span>
                <span className="hero-chrome__tr">©2026 — Paris, FR</span>
                <span className="hero-chrome__bl">
                  I don’t write code. I materialize a vision of the world.
                </span>
                <span className="hero-chrome__role">
                  So called <span className="accent">“Software engineer”</span>
                </span>
              </div>
            </div>
          </section>
        )}

        <Suspense fallback={null}>
          <Manifeste />
          <ProjectMobilistud />
          <ProjectInkgora />
          <ChapterBreak />
          <Personal />
          <Contact />
        </Suspense>
      </main>

      {!loading && <SiteChrome />}

      {!isMobile && (
        <div ref={hintRef} className="scroll-indicator" aria-hidden="true">
          scroll <span className="line" />
        </div>
      )}
    </>
  );
}

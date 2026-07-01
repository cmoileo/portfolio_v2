import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Personal() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".personal__reveal",
        { opacity: 0, filter: "blur(16px)", y: 30 },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          ease: "power2.out",
          duration: 1.2,
          stagger: 0.18,
          scrollTrigger: { trigger: root.current, start: "top 68%" },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="section section--light">
      <div className="shell">
        <div
          className="flex flex-col"
          style={{ gap: "clamp(20px, 3vh, 44px)", maxWidth: "100ch" }}
        >
          <span className="section__label personal__reveal blur-in">
            — about
          </span>
          <h2 className="personal__line blur-in personal__reveal">
            I over-think everything.
          </h2>
          <h2 className="personal__line accent blur-in personal__reveal">
            I struggle to connect with people.
          </h2>
          <p
            className="personal__note blur-in personal__reveal"
            style={{ maxWidth: "54ch" }}
          >
            Promise I’m trying to fix it — I’ve just opened an issue about it on
            GitHub.
          </p>
        </div>
      </div>
    </section>
  );
}

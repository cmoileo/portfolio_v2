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
            I can’t ship what I don’t love.
          </h2>
          <p
            className="personal__note blur-in personal__reveal"
            style={{ maxWidth: "54ch" }}
          >
            I’m told it’s a flaw. I’ve opened an issue about it — don’t expect a
            fix anytime soon.
          </p>

          <div className="issue-card blur-in personal__reveal" role="figure">
            <div className="issue-card__head">
              <span className="issue-card__repo">leo-fezard / self</span>
              <span className="issue-card__state">● Open</span>
            </div>
            <p className="issue-card__title">
              Fix: refuses to ship “good enough”
            </p>
            <div className="issue-card__meta">
              <span>#001</span>
              <span>opened 24 years ago</span>
              <span>0 comments</span>
              <span className="issue-card__label">wontfix</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

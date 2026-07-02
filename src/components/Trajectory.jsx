import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    year: "2019",
    kicker: "English studies",
    title: "Words, first.",
    body: "Three years of English literature (LLCER). I loved the language — not what I could build with it. I wanted work I could touch, in a field I'd never be done learning.",
  },
  {
    year: "2021",
    kicker: "The pivot",
    title: "Two degrees, one year.",
    body: "Final year of the literature licence by night, remote. First year at École Supérieure du Digital by day. Food delivery work by evening. Traded sleep for a new direction — zero regrets.",
  },
  {
    year: "2022",
    kicker: "The wide net",
    title: "Every digital craft.",
    body: "Design, strategy, product, marketing — two years learning the whole digital chain. And code kept pulling on the side, just because I loved it.",
  },
  {
    year: "2023",
    kicker: "Specialisation",
    title: "Code wins.",
    body: "Third year: developer track. Capstone: a full project-management platform, ReactJS + NestJS. Meanwhile, first production work at Agence Thrive.",
  },
  {
    year: "2024",
    kicker: "Fullstack",
    title: "Real SaaS, real stakes.",
    body: "Ooviiz at Thegreenshot — a multi-tenant B2B SaaS for audiovisual production. Alongside: Mastère at EFREI, thesis on agentic design.",
  },
  {
    year: "2026",
    kicker: "Now",
    title: "My own visions.",
    body: "Mobilistud and Inkgora, shipped end-to-end. The code was never the point — what it materializes is.",
  },
];

/**
 * The career path told as an editorial timeline. A red line inks its way
 * down the rail as you scroll; each milestone's outlined Ultra year gets
 * "printed" (filled red) the moment the line reaches it — the same
 * letterpress vocabulary as the loader and the chapter numerals.
 */
export default function Trajectory() {
  const root = useRef(null);
  const listRef = useRef(null);
  const fillRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".traj__head > *", {
        y: 26,
        opacity: 0,
        ease: "power3.out",
        duration: 0.9,
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 72%" },
      });

      // The red line inks downward, pinned to the same viewport depth the
      // entries use to flip — line and milestones stay in lockstep.
      gsap.fromTo(
        fillRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 62%",
            end: "bottom 62%",
            scrub: 0.4,
          },
        },
      );

      gsap.utils.toArray(".traj__entry").forEach((el) => {
        gsap.from(el.querySelectorAll(".traj__year, .traj__content > *"), {
          y: 24,
          opacity: 0,
          ease: "power3.out",
          duration: 0.8,
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 80%" },
        });
        ScrollTrigger.create({
          trigger: el,
          start: "top 62%",
          onEnter: () => el.classList.add("is-inked"),
          onLeaveBack: () => el.classList.remove("is-inked"),
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="section section--light">
      <div className="shell">
        <div
          className="traj__head"
          style={{ marginBottom: "clamp(48px, 9vh, 110px)" }}
        >
          <span className="section__label">— 04 / trajectory</span>
          <h2 className="traj__headline">
            From Shakespeare
            <br />
            to <span className="accent">shipping.</span>
          </h2>
        </div>

        <div className="traj" ref={listRef}>
          <div className="traj__rail" aria-hidden="true">
            <i ref={fillRef} className="traj__rail-fill" />
          </div>

          {STEPS.map((s) => (
            <article key={s.year} className="traj__entry">
              <i className="traj__dot" aria-hidden="true" />
              <span className="traj__year" aria-hidden="true">
                {s.year}
              </span>
              <div className="traj__content">
                <span className="traj__kicker">
                  — {s.year} / {s.kicker}
                </span>
                <h3 className="traj__title">{s.title}</h3>
                <p className="traj__body">{s.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FigureFrame from "./FigureFrame.jsx";
import ProjectFigureLink from "./ProjectFigureLink.jsx";
import { boxFaces, project } from "../lib/iso.js";

gsap.registerPlugin(ScrollTrigger);

const STACK = [
  "Laravel",
  "Next.js",
  "React Native",
  "Expo",
  "PostgreSQL",
  "App Store",
];

const INK = "#141414";
const RED = "#C8060F";
const CREAM = "#EDE6D4";
const PAGE_LINE = "rgba(17,17,17,0.28)";
const EDGE = "rgba(17,17,17,0.55)";

const W = 440;
const H = 520;

const seg = (a, b) => {
  const p = project(...a);
  const q = project(...b);
  return { x1: p[0], y1: p[1], x2: q[0], y2: q[1] };
};

/* A book lying flat: coloured cover on top, spine on the left face, cream
   page-edges (with striations) on the right face. The inner `.ink-book`
   group is what fans out on hover (kept separate from the GSAP entrance
   group so the two transforms never fight). */
function Book({ index, x, y, z, w, d, h, cover, spine }) {
  const f = boxFaces(x, y, z, w, d, h);
  const lines = [];
  const n = 4;
  for (let k = 1; k <= n; k++) {
    const zk = z + (h * k) / (n + 1);
    lines.push(seg([x + w, y + 0.12, zk], [x + w, y + d - 0.12, zk]));
  }
  return (
    <g className="inkgora-fig__rise">
      <g
        className="ink-book"
        style={{ "--i": index, transitionDelay: `${index * 40}ms` }}
      >
        <polygon
          points={f.left}
          fill={spine}
          stroke={EDGE}
          strokeWidth="0.75"
        />
        <polygon
          points={f.right}
          fill={CREAM}
          stroke={EDGE}
          strokeWidth="0.75"
        />
        {lines.map((l, i) => (
          <line key={i} {...l} stroke={PAGE_LINE} strokeWidth="0.9" />
        ))}
        <polygon points={f.top} fill={cover} stroke={EDGE} strokeWidth="0.75" />
      </g>
    </g>
  );
}

export default function ProjectInkgora() {
  const root = useRef(null);
  const figRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".inkgora__text", {
        x: -90,
        opacity: 0,
        ease: "expo.out",
        duration: 1.15,
        scrollTrigger: { trigger: root.current, start: "top 68%" },
      });
      // Books rise into a neat stack, one after another.
      gsap.from(".inkgora-fig__rise", {
        yPercent: 16,
        opacity: 0,
        ease: "power3.out",
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: { trigger: figRef.current, start: "top 78%" },
      });
      gsap.from(".inkgora-fig__quote", {
        opacity: 0,
        scale: 0.6,
        transformOrigin: "left top",
        ease: "back.out(1.7)",
        duration: 0.9,
        delay: 0.35,
        // hand the transform back to CSS so the hover lean can take over
        clearProps: "transform",
        scrollTrigger: { trigger: figRef.current, start: "top 78%" },
      });
      gsap.from(".inkgora-fig .fig-frame", {
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: { trigger: figRef.current, start: "top 78%" },
      });
      gsap.from(".inkgora__meta > *", {
        y: 24,
        opacity: 0,
        ease: "power3.out",
        duration: 0.8,
        stagger: 0.08,
        scrollTrigger: { trigger: ".inkgora__meta", start: "top 85%" },
      });
      gsap.to(figRef.current, {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const books = [
    { x: 0, y: 0, z: 0, w: 3.1, d: 2.3, h: 0.36, cover: INK, spine: "#000000" },
    {
      x: 0.16,
      y: -0.2,
      z: 0.36,
      w: 2.95,
      d: 2.2,
      h: 0.36,
      cover: RED,
      spine: "#8E0A10",
    },
    {
      x: -0.14,
      y: 0.18,
      z: 0.72,
      w: 3.15,
      d: 2.15,
      h: 0.34,
      cover: CREAM,
      spine: "#C9BE9C",
    },
    {
      x: 0.1,
      y: -0.06,
      z: 1.06,
      w: 2.55,
      d: 1.85,
      h: 0.36,
      cover: INK,
      spine: "#000000",
    },
  ];

  return (
    <section ref={root} className="section section--light">
      <div className="shell">
        <div className="project-grid">
          {/* text */}
          <div
            className="flex flex-col inkgora__text"
            style={{ gap: "clamp(20px, 3vh, 40px)" }}
          >
            <span className="project__index">
              — <span className="accent">02</span> / Inkgora
            </span>
            <h2 className="project__headline">
              Don’t only read,
              <br />
              <span className="uppercase accent">speak.</span>
            </h2>
            <div
              className="flex flex-col inkgora__meta"
              style={{ gap: "24px" }}
            >
              <p className="project__body">
                Books change people. Nobody talks about it. I built the place
                where they do.
              </p>
              <div className="stack-tags">
                {STACK.map((s) => (
                  <span key={s} className="stack-tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* isometric book-stack plate */}
          <ProjectFigureLink
            href="https://inkgora.com"
            label="inkgora.com"
            tone="light"
          >
            <svg
              ref={figRef}
              className="inkgora-fig"
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
            >
              <FigureFrame
                w={W}
                h={H}
                index="02"
                caption="BOOKS THAT SPEAK"
                tone="light"
              />

              <text
                className="inkgora-fig__quote"
                x="84"
                y="250"
                fontFamily='"Ultra", "Editorial New", Georgia, serif'
                fontSize="205"
                fill={RED}
              >
                “
              </text>

              {/* sound waves — the books "speak" on hover */}
              <g
                className="inkgora-fig__wave"
                stroke={RED}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              >
                <path
                  d="M300 150 a 15 15 0 0 1 0 38"
                  style={{ transitionDelay: "0ms" }}
                />
                <path
                  d="M312 143 a 25 25 0 0 1 0 52"
                  style={{ transitionDelay: "80ms" }}
                />
                <path
                  d="M324 137 a 35 35 0 0 1 0 66"
                  style={{ transitionDelay: "160ms" }}
                />
              </g>

              <g transform="translate(214, 300) scale(1.42)">
                <ellipse
                  cx="0"
                  cy="6"
                  rx="92"
                  ry="34"
                  fill="rgba(17,17,17,0.12)"
                />
                {books.map((b, i) => (
                  <Book key={i} index={i} {...b} />
                ))}
              </g>
            </svg>
          </ProjectFigureLink>
        </div>
      </div>
    </section>
  );
}

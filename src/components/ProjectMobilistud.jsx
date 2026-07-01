import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FigureFrame from "./FigureFrame.jsx";
import ProjectFigureLink from "./ProjectFigureLink.jsx";
import { boxFaces, rightPatch, leftPatch } from "../lib/iso.js";

gsap.registerPlugin(ScrollTrigger);

const STACK = ["AdonisJS", "ReactJS", "PostgreSQL", "Railway"];

/* ---- palette for the plate (dark section) ---- */
const TOP = "#FAFAFA";
const FRONT = "#C8060F";
const SIDE = "#8E0A10";
const ROOF = "#F2C9CC";

const W = 440;
const H = 520;

/* An isometric solid: three shaded faces + optional glass panels that
   light up (staggered) when the plate is hovered. */
function Solid({ x, y, z, w, d, h, windows = [], winDelay = 0 }) {
  const f = boxFaces(x, y, z, w, d, h);
  return (
    <g className="mobilistud-fig__rise">
      <polygon points={f.left} fill={SIDE} />
      <polygon points={f.right} fill={FRONT} />
      <polygon points={f.top} fill={TOP} />
      {windows.map((p, i) => (
        <polygon
          key={i}
          className="fig-win"
          points={p}
          style={{ transitionDelay: `${(winDelay + i) * 45}ms` }}
        />
      ))}
    </g>
  );
}

export default function ProjectMobilistud() {
  const root = useRef(null);
  const figRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".mobilistud__head", {
        x: -80,
        opacity: 0,
        ease: "expo.out",
        duration: 1.2,
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
      gsap.from(".mobilistud__meta > *", {
        y: 26,
        opacity: 0,
        ease: "power3.out",
        duration: 0.8,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 60%" },
      });
      // The tower assembles itself floor by floor.
      gsap.from(".mobilistud-fig__rise", {
        yPercent: 12,
        opacity: 0,
        ease: "power3.out",
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: { trigger: figRef.current, start: "top 80%" },
      });
      gsap.from(".mobilistud-fig .fig-frame", {
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: { trigger: figRef.current, start: "top 80%" },
      });
      // Gentle parallax of the whole plate.
      gsap.to(figRef.current, {
        yPercent: -14,
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

  // Footprint of the tower + windows generated per floor.
  const fw = 2.6;
  const floors = [0, 1.1, 2.2];
  const winStarts = [0.4, 1.55];
  const winW = 0.55;
  const mkWindows = (z0) =>
    winStarts.flatMap((s) => [
      rightPatch(fw, s, s + winW, z0 + 0.26, z0 + 0.86),
      leftPatch(fw, s, s + winW, z0 + 0.26, z0 + 0.86),
    ]);

  return (
    <section ref={root} className="section section--dark">
      <div className="shell">
        <div className="project-grid">
          {/* text column */}
          <div
            className="flex flex-col"
            style={{ gap: "clamp(20px, 3vh, 40px)" }}
          >
            <span className="project__index">
              — <span className="accent">01</span> / Mobilistud
            </span>
            <h2 className="mobilistud__head project__headline">
              Housing should be a <span className="accent">right</span>, not a
              <span className="erased">privilege</span>.
            </h2>
            <div
              className="flex flex-col mobilistud__meta"
              style={{ gap: "24px" }}
            >
              <p className="project__body" style={{ color: "#fafafa" }}>
                Every year, thousands of students pay two rents at once. I built
                the fix.
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

          {/* isometric housing plate */}
          <ProjectFigureLink
            href="https://mobilistud.com"
            label="mobilistud.com"
            tone="dark"
          >
            <svg
              ref={figRef}
              className="mobilistud-fig"
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
            >
              <FigureFrame
                w={W}
                h={H}
                index="01"
                caption="STUDENT HOUSING"
                tone="dark"
              />

              <g transform="translate(248, 356)">
                {/* ground shadow */}
                <ellipse
                  cx="-6"
                  cy="6"
                  rx="120"
                  ry="46"
                  fill="rgba(0,0,0,0.35)"
                />

                {/* annex block, front-left */}
                <Solid x={-1.9} y={0.7} z={0} w={1.5} d={1.5} h={1.9} />

                {/* main tower — three residential floors, lit bottom-up */}
                {floors.map((z0, i) => (
                  <Solid
                    key={i}
                    x={0}
                    y={0}
                    z={z0}
                    w={fw}
                    d={fw}
                    h={1.1}
                    windows={mkWindows(z0)}
                    winDelay={i * 4}
                  />
                ))}

                {/* rooftop cap */}
                <g className="mobilistud-fig__rise">
                  {(() => {
                    const r = boxFaces(0.35, 0.35, 3.3, 1.9, 1.9, 0.34);
                    return (
                      <>
                        <polygon points={r.left} fill={SIDE} />
                        <polygon points={r.right} fill={FRONT} />
                        <polygon points={r.top} fill={ROOF} />
                      </>
                    );
                  })()}
                </g>
              </g>
            </svg>
          </ProjectFigureLink>
        </div>
      </div>
    </section>
  );
}

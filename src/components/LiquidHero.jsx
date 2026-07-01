import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 *  Palette
 * ------------------------------------------------------------------ */
const PAPER = "#FAFAFA";
const INK = "#111111";

const displayFont = (size) =>
  `${size}px "Ultra", "Editorial New", Georgia, serif`;

function fitFontSize(ctx, text, maxWidth, maxSize, minSize, fontFor) {
  let size = maxSize;
  ctx.font = fontFor(size);
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = fontFor(size);
  }
  return size;
}

/* ------------------------------------------------------------------ *
 *  Headline composition rendered once onto an opaque 2D canvas.
 *  The shader then samples this image with a per-channel offset to
 *  produce the chromatic-aberration "misregistration" look, so the
 *  source is kept dead simple: paper ground, ink type, one red accent.
 * ------------------------------------------------------------------ */
function makeHeadlineCanvas() {
  // Image aspect kept ~= the desktop viewport so cover-fit barely crops and the
  // name's on-screen size stays predictable.
  const W = 2000;
  const H = 1250;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const cx = W / 2;

  // Only the name lives in the distorted layer — its thick strokes survive the
  // chromatic offset cleanly. The small labels are kept crisp in HTML.
  const titleSize = fitFontSize(ctx, "FEZARD", W * 0.72, 380, 80, displayFont);
  ctx.font = displayFont(titleSize);
  ctx.fillStyle = INK;
  const lh = titleSize * 0.88;
  ctx.fillText("LÉO", cx, H * 0.5 - lh * 0.5);
  ctx.fillText("FEZARD", cx, H * 0.5 + lh * 0.5);

  return canvas;
}

/* ------------------------------------------------------------------ *
 *  Shaders
 * ------------------------------------------------------------------ */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uTex;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uMouseStr;
  uniform float uDissolve;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform vec3  uPaper;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // contain/cover fit of the image inside the plane (cover)
  vec2 coverUv(vec2 uv) {
    float ia = uImageAspect;
    float pa = uPlaneAspect;
    vec2 s = (pa > ia) ? vec2(1.0, ia / pa) : vec2(pa / ia, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    float pa = uPlaneAspect;

    // ---- liquid displacement: a ripple that radiates from the pointer,
    // localised by an exp() falloff, plus a very gentle low-frequency
    // breathing so the surface is alive without banding the channels.
    vec2 p  = vec2(uv.x * pa, uv.y);
    vec2 mp = vec2(uMouse.x * pa, uMouse.y);
    vec2 toM = p - mp;
    float d = length(toM);
    float ripple = sin(d * 13.0 - uTime * 2.4) * exp(-d * 5.0);
    vec2 dir = toM / (d + 1e-4);
    vec2 disp = dir * ripple * (0.0010 + 0.022 * uMouseStr);
    disp += 0.0007 * vec2(
      sin(uv.y * 2.6 + uTime * 0.45),
      sin(uv.x * 2.2 + uTime * 0.38)
    );

    // ---- chromatic aberration: a small, horizontal-only red/cyan split that
    // grows where the surface is actually moving (near the pointer).
    float ab = 0.0011 + length(disp) * 0.9 + uMouseStr * 0.006;
    vec2 cuv = coverUv(uv + disp);
    float r = texture2D(uTex, cuv + vec2(ab, 0.0)).r;
    float g = texture2D(uTex, cuv).g;
    float b = texture2D(uTex, cuv - vec2(ab, 0.0)).b;
    vec3 col = vec3(r, g, b);

    // ---- dissolve into grain (drives both the load-in and the scroll-out)
    const float W = 0.28;
    float t = uDissolve * (1.0 + 2.0 * W) - W;
    float field = vnoise(uv * 8.0 + uTime * 0.05);
    float reveal = smoothstep(t - W, t + W, field);

    col = mix(uPaper, col, reveal);

    float grain = hash(uv * vec2(1200.0, 760.0) + fract(uTime));
    float edge = 1.0 - abs(reveal * 2.0 - 1.0);     // peaks in the transition band
    col -= edge * step(0.55, grain) * 0.12;          // specks where it crumbles
    col += (grain - 0.5) * 0.022;                    // faint constant film grain

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ------------------------------------------------------------------ *
 *  Fullscreen distorted plane
 * ------------------------------------------------------------------ */
function HeadlinePlane({ progressRef, started }) {
  const { viewport, size } = useThree();
  const matRef = useRef();

  // pointer state (target + smoothed) and a decaying movement strength
  const mouse = useRef({ tx: 0.5, ty: 0.5, x: 0.5, y: 0.5, str: 0 });
  const reveal = useRef(0);

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(makeHeadlineCanvas());
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.anisotropy = 8;
    return tex;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseStr: { value: 0 },
      uDissolve: { value: 1 },
      uImageAspect: { value: texture.image.width / texture.image.height },
      uPlaneAspect: { value: 1 },
      uPaper: { value: new THREE.Color(PAPER) },
    }),
    [texture],
  );

  useEffect(() => {
    let last = null;
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      mouse.current.tx = x;
      mouse.current.ty = y;
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        mouse.current.str = Math.min(
          1,
          mouse.current.str + Math.hypot(dx, dy) * 6,
        );
      }
      last = { x, y };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  useFrame((_, delta) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    const dt = Math.min(delta, 0.05);

    u.uTime.value += dt;

    // smooth the pointer, decay its strength
    const m = mouse.current;
    m.x += (m.tx - m.x) * 0.08;
    m.y += (m.ty - m.y) * 0.08;
    m.str *= 0.92;
    u.uMouse.value.set(m.x, m.y);
    u.uMouseStr.value = m.str;

    // load-in materialisation (fixed ~1.6s so it resolves fully to crisp),
    // then scroll-out dissolve — whichever is stronger drives the grain.
    if (started) reveal.current = Math.min(1, reveal.current + dt / 1.6);
    const scroll = Math.min(1, Math.max(0, (progressRef?.current ?? 0) / 0.8));
    u.uDissolve.value = Math.max(1 - reveal.current, scroll);

    u.uPlaneAspect.value = size.width / size.height;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 *  Public component
 * ------------------------------------------------------------------ */
export default function LiquidHero({ progressRef, started }) {
  return (
    <div
      className="liquid-hero"
      style={{ position: "absolute", inset: 0, zIndex: 10, background: PAPER }}
    >
      <Canvas
        dpr={[1, 2]}
        frameloop="always"
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1, near: 0.01, far: 10 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <HeadlinePlane progressRef={progressRef} started={started} />
      </Canvas>
    </div>
  );
}

# Léo Fezard — Portfolio

A brutalist-editorial creative portfolio. Built around a scroll-driven 3D
typographic tunnel (React Three Fiber), GSAP/ScrollTrigger scene choreography,
and Lenis smooth scroll.

> So called "Software engineer".

## Stack

- **React + Vite**
- **React Three Fiber / Three.js** — the hero tunnel
- **GSAP + ScrollTrigger** — all scroll-driven animation
- **Lenis** — smooth scroll, fed into the GSAP ticker
- **Framer Motion** — loader flash + micro-interactions
- **Tailwind CSS** — layout only (visual styling lives in `src/styles/globals.css`)

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Fonts

Two faces are used:

| Role | Font | Status |
| --- | --- | --- |
| Display / headings | **Editorial New** (PP Editorial New, italic ultrabold) | _you provide_ |
| UI / mono | **Geist Mono** (OFL) | bundled |

**Editorial New is a Pangram Pangram font (free for _personal_ use) and is not
redistributed in this repo.** A high-contrast serif italic (Playfair Display,
OFL) is bundled as a visible fallback so the design reads correctly out of the
box. To use the real Editorial New, drop the licensed `.woff2` files into
`public/fonts/`:

```
public/fonts/EditorialNew-Italic.woff2
public/fonts/EditorialNew-UltraboldItalic.woff2
```

They are picked up automatically by the `@font-face` rules in
`src/styles/globals.css` — no code change needed. This applies to both the HTML
and the 3D tunnel text (the tunnel rasterises whatever display face is loaded).

## Design system

| Token | Value |
| --- | --- |
| Background | `#FAFAFA` |
| Ink / primary | `#111111` |
| Accent | `#C8060F` |

## Structure

```
src/
  components/
    Loader.jsx            terminal boot loader → white-flash cut
    TunnelHero.jsx        R3F typographic tunnel (4 walls, 20 frame rings)
    HeroOverlay.jsx       scramble-revealed hero title over the tunnel
    Manifeste.jsx
    ProjectMobilistud.jsx
    ProjectInkgora.jsx
    Personal.jsx
    Contact.jsx
    CustomCursor.jsx      lerp dot + difference-blend ring
    GrainOverlay.jsx      animated SVG-noise grain
  hooks/
    useScrollProgress.js
    useTextScramble.js
  styles/
    globals.css           @font-face, tokens, grain, all visual styling
  App.jsx                 Lenis ⇄ GSAP wiring, loader gating, hero ScrollTrigger
  main.jsx
```

## Notes

- **Mobile (≤ 768px):** the 3D tunnel is disabled and replaced with a static
  full-screen text hero for performance.
- **Reduced motion** is respected (`prefers-reduced-motion`).
- `public/og-image.png` and `public/cv.pdf` are placeholders — swap with the
  real assets before shipping.
- The tunnel renders the four walls as canvas-text textures (≈4 draw calls)
  rather than hundreds of 3D text meshes, and disposes its textures/geometries
  on unmount.

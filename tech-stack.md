# Tech stack

Overview of the frontend, animation, and hosting choices for this site.

---

## Vite + React + TypeScript

**Role:** Application shell, routing (SPA), and UI composition.

**Why:**

- Vite gives fast dev feedback and production builds with sensible default chunking for static assets and JS splits.
- React keeps state and layout colocated with components as the page grows.
- TypeScript catches interface drift early and scales better than untyped JS for a long-lived portfolio.

---

## GSAP + ScrollTrigger

**Role:** Scroll-driven **image sequence** — map scroll position to frame index, pin sections, and scrub timelines.

**Why:**

- ScrollTrigger is built for scroll-linked timelines and scrubbing; it stays the common choice for Apple-style frame sequences.
- Drawing frames to a **`<canvas>`** avoids hundreds of `<img>` swaps in the DOM (layout thrash, memory churn) and keeps scrubbing/interpolation under your control at the pixel level.

**Boundary:** Scroll-scrubbed sequences and scroll layout live here — not general component mount animations (see Framer Motion).

---

## Framer Motion

**Role:** Non-scroll animation — section entrances, typography fades, card reveals, hover/focus micro-interactions.

**Why:**

- Declarative API fits React; animation variants stay next to the components they belong to.
- Keeps GSAP scoped to scroll choreography instead of mixing every tween in one system.

**Note:** For a very small surface area, GSAP alone could cover both; two libraries are justified when you want React-native motion APIs separate from scroll timelines.

---

## Cloudflare Pages

**Role:** Static hosting and global CDN for HTML, JS, CSS, and image sequence assets.

**Why:**

- Static assets at the edge; simple deploy model tied to Git (e.g. push to `main` → production).
- Free tier is generous for a portfolio’s traffic pattern.

**Reality check:** “No Functions” is true **only** if the site is 100% static (e.g. `mailto:` links). A **contact form that calls Resend** needs a **server-side secret**, which on Pages means **Pages Functions** (or another backend). The site is still “static-first”; the function is a thin POST handler, not a full server.

---

## Summary

| Layer        | Choice                    | Primary job                                      |
| ------------ | ------------------------- | ------------------------------------------------ |
| Build / app  | Vite, React, TypeScript   | SPA, components, maintainability                 |
| Scroll / seq | GSAP ScrollTrigger        | Pin, scrub, canvas frame index                 |
| UI motion    | Framer Motion             | Entrances, fades, micro-interactions             |
| Host / CDN   | Cloudflare Pages (+ DNS)  | Static deploy, edge delivery, Git deploys      |
| Email (API)  | Resend + Pages Function   | Secure server-side send (not in client bundle)   |

# kevthedev

Personal site for [kevthedev.site](https://kevthedev.site) — Vite + Three.js + GSAP, hosted on Cloudflare Pages.

## Develop

```bash
npm install
npm run dev          # Vite dev server (no /api/contact)
npm run pages:dev    # build + run with Pages Functions on :8788
```

For the contact form locally, copy `.env.example` to `.dev.vars` and fill in `RESEND_API_KEY`.

## Structure

- `index.html` — page content and sections
- `src/scene/` — Three.js scene (fixed full-screen canvas)
- `src/scroll.js` — GSAP ScrollTrigger timelines that drive the scene
- `src/contact.js` — contact form client
- `functions/api/contact.js` — Pages Function that emails form submissions via Resend
- `raw/` — source photos (not deployed)

## Deploy

Cloudflare Pages builds `main` automatically: build command `npm run build`, output `dist`.
Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `RESEND_FROM` under Pages → Settings → Variables and secrets.

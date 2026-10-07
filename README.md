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

- `index.html` — page markup: film, digital terrain, and content sections
- `src/film.js` — scroll-scrubbed opening film (WebP frame sequence on a canvas)
- `src/digital.js` — Three.js terrain: snow → points → wireframe mountains + red route
- `src/sections.js` — GSAP reveals, nav state, hobbies/process line animations
- `src/contact.js` — contact form client
- `functions/api/contact.js` — Pages Function that emails form submissions via Resend
- `public/film/` — generated film frames (`lg` 16:9 desktop, `sm` 9:16 phones)
- `public/img/` — section imagery
- `scripts/build-film.sh` — rebuilds `public/film/` from the approved clips in `raw/video/v1`
- `raw/film-manifest.md` — Higgsfield job IDs for every keyframe and clip

`raw/reference/`, `raw/keyframes/` and `raw/video/` are git-ignored (personal photos
and large generated media).

## Deploy

Cloudflare Pages builds `main` automatically: build command `npm run build`, output `dist`.
Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `RESEND_FROM` under Pages → Settings → Variables and secrets.

# kevthedev

Personal site for [kevthedev.site](https://kevthedev.site) — Vite + Three.js + GSAP, hosted on Cloudflare Pages.

## Develop

```bash
npm install
npm run dev          # Vite dev server (no /api/contact)
```

For the contact form locally, copy `.env.example` to `.env.local` and fill in `VITE_WEB3FORMS_KEY`.

## Structure

- `index.html` — page markup: film, digital terrain, and content sections
- `src/film.js` — scroll-scrubbed opening film (WebP frame sequence on a canvas)
- `src/digital.js` — Three.js terrain: snow → points → wireframe mountains + red route
- `src/sections.js` — GSAP reveals, nav state, hobbies/process line animations
- `src/contact.js` — contact form, sent via Web3Forms to heidemakevin@gmail.com
- `public/film/` — generated film frames (`lg` 16:9 desktop, `sm` 9:16 phones)
- `public/img/` — section imagery
- `scripts/build-film.sh` — rebuilds `public/film/` from the approved clips in `raw/video/v1`
- `raw/film-manifest.md` — Higgsfield job IDs for every keyframe and clip

`raw/reference/`, `raw/keyframes/` and `raw/video/` are git-ignored (personal photos
and large generated media).

## Deploy

Cloudflare Pages builds `main` automatically: build command `npm run build`, output `dist`.
Set `VITE_WEB3FORMS_KEY` under Pages → Settings → Variables and secrets (needed at build time).

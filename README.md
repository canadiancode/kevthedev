# kevthedev

Personal site for [kevthedev.site](https://kevthedev.site) — Vite + Three.js + GSAP, hosted on Cloudflare Pages.

## Develop

```bash
npm install
npm run dev          # Vite dev server (no /api/contact)
```

The contact form posts to Web3Forms; its public access key is in `src/contact.js`.

## Structure

- `index.html` — page markup: film, digital terrain, and content sections
- `src/film.js` — scroll-scrubbed opening film (WebP frame sequence on a canvas)
- `src/digital.js` — Three.js terrain: snow → points → wireframe mountains + red route
- `src/sections.js` — GSAP reveals, nav state, hobbies/process line animations
- `src/contact.js` — contact form, sent via Web3Forms to heidemakevin@gmail.com
- `src/webmcp.js` — WebMCP tools for in-browser AI agents (profile, services, work, contact)
- `public/llms.txt`, `robots.txt`, `sitemap.xml` — crawler and AI-agent summaries; structured data is JSON-LD in `index.html`
- `public/film/` — generated film frames (`lg` 16:9 desktop, `sm` 9:16 phones)
- `public/img/` — section imagery
- `scripts/build-film.sh` — rebuilds `public/film/` from the approved clips in `raw/video/v1`
- `raw/film-manifest.md` — Higgsfield job IDs for every keyframe and clip

`raw/reference/`, `raw/keyframes/` and `raw/video/` are git-ignored (personal photos
and large generated media).

## Deploy

Cloudflare Pages builds `main` automatically: build command `npm run build`, output `dist`.
`www.kevthedev.site` 301-redirects to `kevthedev.site` via a zone Redirect Rule.

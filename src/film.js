import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Scroll-scrubbed opening film. Frames are pre-rendered WebP stills
// (scripts/build-film.sh) drawn to a canvas; scroll position picks the frame.
// Frames load in coarse-to-fine passes so the whole film is scrubbable early
// and fills in detail as it downloads.

const PASSES = [32, 16, 8, 4, 2, 1]
const CONCURRENCY = 6

export async function initFilm() {
  const section = document.querySelector('.film')
  const canvas = document.getElementById('film-canvas')
  const ctx = canvas.getContext('2d')
  const loader = document.getElementById('film-loader')
  const routeFill = document.getElementById('route-fill')
  const routeStops = [...document.querySelectorAll('.route li')]
  const chapters = [...section.querySelectorAll('.chapter')]
  const hint = document.getElementById('scroll-hint')
  const endFade = [document.getElementById('film-shade'), document.getElementById('route'), document.getElementById('film-ui')]
  const handoff = document.getElementById('digital-from')

  const meta = await fetch('/film/meta.json').then((r) => r.json())
  const total = meta.frames
  const portrait = matchMedia('(max-aspect-ratio: 1/1)')
  let set = portrait.matches ? 'sm' : 'lg'
  let frames = new Array(total)
  let loaded = 0
  let current = 0
  let drawn = -1

  const src = (i) => `/film/${set}/${String(i + 1).padStart(4, '0')}.webp`
  // The terrain section opens on the film's final frame so the cut is seamless.
  const setHandoff = () => (handoff.src = src(total - 1))
  setHandoff()

  function loadFrame(i, forSet) {
    return new Promise((resolve) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (forSet === set && !frames[i]) {
          frames[i] = img
          loaded++
          loader.style.setProperty('--p', loaded / total)
          if (Math.abs(i - current) < 32) draw(true)
        }
        resolve()
      }
      img.onerror = resolve
      img.src = src(i)
    })
  }

  async function loadAll() {
    const forSet = set
    const order = []
    const seen = new Set()
    for (const step of PASSES) {
      for (let i = 0; i < total; i += step) {
        if (!seen.has(i)) {
          seen.add(i)
          order.push(i)
        }
      }
    }
    let next = 0
    const worker = async () => {
      while (next < order.length && forSet === set) {
        await loadFrame(order[next++], forSet)
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    if (forSet === set) loader.classList.add('done')
  }

  function nearestLoaded(i) {
    for (let d = 0; d < total; d++) {
      if (frames[i - d]) return frames[i - d]
      if (frames[i + d]) return frames[i + d]
    }
    return null
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = Math.round(innerWidth * dpr)
    canvas.height = Math.round(innerHeight * dpr)
    draw(true)
  }

  function draw(force = false) {
    if (!force && current === drawn) return
    const img = nearestLoaded(current)
    if (!img) return
    const cw = canvas.width
    const ch = canvas.height
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
    drawn = current
    canvas.classList.add('ready')
  }

  function updateOverlays(p) {
    routeFill.style.strokeDashoffset = 1 - p
    routeStops.forEach((li) => li.classList.toggle('passed', p >= Number(li.dataset.at)))
    hint.style.opacity = Math.max(0, 1 - p * 30)
    // Clear the shading and UI over the last frames so the final frame is clean.
    const clean = 1 - clamp((p - 0.955) / 0.04)
    endFade.forEach((el) => (el.style.opacity = clean))

    const fade = 0.035
    chapters.forEach((el, idx) => {
      const from = Number(el.dataset.from)
      const to = Number(el.dataset.to)
      const fadeIn = idx === 0 ? 1 : clamp((p - from) / fade)
      const fadeOut = clamp((to - p) / fade)
      const o = Math.min(fadeIn, fadeOut)
      el.style.opacity = o
      el.style.transform = `translate3d(0, ${(1 - o) * (p < from + fade ? 30 : -30)}px, 0)`
      el.style.visibility = o > 0.01 ? 'visible' : 'hidden'
    })
  }

  const state = { frame: 0 }
  gsap.to(state, {
    frame: total - 1,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => updateOverlays(self.progress),
    },
    onUpdate: () => {
      current = Math.round(state.frame)
      draw()
    },
  })

  portrait.addEventListener('change', () => {
    set = portrait.matches ? 'sm' : 'lg'
    setHandoff()
    frames = new Array(total)
    loaded = 0
    loader.classList.remove('done')
    loadAll()
  })

  addEventListener('resize', resize)
  resize()
  updateOverlays(0)
  loadAll()
}

const clamp = (v) => Math.min(1, Math.max(0, v))

ScrollTrigger.config({ ignoreMobileResize: true })

import { gsap } from 'gsap'

// "Lights On" intro. A dark garage with a rolling counter while the opening
// film's frames download; at 100 the overhead lamp flickers on and its light
// spreads out to reveal the real first frame underneath, then the hero builds in.
//
// Progress is real: it tracks the film's coarse loading passes (every 8th
// frame), which is enough for the whole film to scrub smoothly.
//
// Runs once per browser session (see the inline script in index.html). Add
// ?loader to force it, or ?loader=slow to fake a slow connection.

const MIN_MS = 1600 // never flash by
const MAX_MS = 8000 // never trap anyone on a bad connection
const READY_STEP = 8 // film.js loads every 32nd, 16th, then 8th frame first

// Lamp position as a fraction of each film set's frame (see public/film/*/0001.webp).
const LAMP = { lg: { x: 0.574, y: 0.076, w: 1280, h: 720 }, sm: { x: 0.735, y: 0.078, w: 540, h: 960 } }

export function initLoader() {
  const root = document.getElementById('loader')
  if (!root || !document.documentElement.classList.contains('is-loading')) return

  const params = new URLSearchParams(location.search)
  const slow = params.get('loader') === 'slow'
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const portrait = matchMedia('(max-aspect-ratio: 1/1)')

  const veil = root.querySelector('.loader-veil')
  const glow = root.querySelector('.loader-glow')
  const line = root.querySelector('.loader-line i')
  const count = root.querySelector('.loader-count')
  const hero = document.querySelector('.chapter-hero')
  const h1 = hero.querySelector('h1')
  const film = [document.querySelector('.film-poster img'), document.getElementById('film-canvas')]
  const chrome = [document.getElementById('route'), document.getElementById('film-ui')]

  history.scrollRestoration = 'manual'
  scrollTo(0, 0)

  // Counter: three odometer columns. Each strip is 0–9 plus a trailing 0 so the
  // ones column can roll through 9 → 0 without jumping back.
  count.innerHTML =
    Array.from({ length: 3 }, () => `<span class="d"><span>${'01234567890'.split('').map((n) => `<span>${n}</span>`).join('')}</span></span>`).join('') +
    '<sup>%</sup>'
  const strips = [...count.querySelectorAll('.d > span')]

  // Hide everything the reveal will build in. film.js drives opacity on the
  // route and film UI, so those fade with a filter instead.
  const h1Html = h1.innerHTML
  h1.innerHTML = h1Html
    .split(/<br\s*\/?>/i)
    .map((l) => `<span class="ln"><span>${l.trim()}</span></span>`)
    .join('')
  const lines = h1.querySelectorAll('.ln > span')
  const heroBits = [hero.querySelector('.kicker'), hero.querySelector('.chapter-actions'), ...hero.querySelectorAll('.hud')]
  gsap.set(lines, { yPercent: 110 })
  gsap.set(heroBits, { autoAlpha: 0, y: 24 })
  gsap.set('#nav', { autoAlpha: 0, y: -16 })
  gsap.set(chrome, { filter: 'opacity(0)' })

  function placeLamp() {
    const l = LAMP[portrait.matches ? 'sm' : 'lg']
    const s = Math.max(innerWidth / l.w, innerHeight / l.h)
    const x = (innerWidth - l.w * s) / 2 + l.x * l.w * s
    const y = (innerHeight - l.h * s) / 2 + l.y * l.h * s
    root.style.setProperty('--lx', `${x}px`)
    root.style.setProperty('--ly', `${y}px`)
    film.forEach((el) => el && (el.style.transformOrigin = `${x}px ${y}px`))
  }
  placeLamp()
  addEventListener('resize', placeLamp)

  // Progress: real frame loads (or a fake stuttering connection in slow mode).
  let target = 0
  if (slow) {
    const tick = () => {
      if (target >= 1) return
      if (Math.random() > 0.25) target = Math.min(1, target + Math.random() * 0.045)
      setTimeout(tick, 110)
    }
    tick()
  } else {
    addEventListener('film:progress', (e) => {
      const { loaded, total } = e.detail
      target = Math.min(1, loaded / Math.ceil(total / READY_STEP))
    })
  }

  const start = performance.now()
  let shown = 0
  let done = false

  function render(v) {
    const x = v * 100
    // Each digit holds, then snaps to the next over the last 35% of its step.
    const f = Math.min(1, Math.max(0, (x % 1 - 0.65) / 0.35))
    const ones = (Math.floor(x) % 10) + f * f * (3 - 2 * f)
    const roll = Math.max(0, ones - 9) // carry rolls the next column during the last tenth
    const tens = (Math.floor(x / 10) % 10) + roll
    const hundreds = Math.floor(x / 100) + (Math.floor(x / 10) % 10 === 9 ? roll : 0)
    ;[hundreds, tens, ones].forEach((n, i) => (strips[i].style.transform = `translateY(${-n * 0.9}em)`))
    count.classList.toggle('full', x >= 99.5)
    line.style.transform = `scaleX(${v})`
    gsap.set(glow, { opacity: 0.1 + v * 0.3, scale: 0.3 + v * 0.25 })
  }

  let last = start
  function frame(now) {
    if (done) return
    const t = now - start
    const dt = Math.min(100, now - last) / 1000
    last = now
    const goal = t > MAX_MS ? 1 : Math.min(target, t / MIN_MS)
    // Ease toward the goal but never slower than 35%/s, so it can't crawl at 98.
    shown = Math.min(goal, shown + dt * Math.max(0.35, (goal - shown) * 4))
    render(shown)
    if (shown === 1) {
      done = true
      reveal()
    } else requestAnimationFrame(frame)
  }

  // Wait for the display font so the counter doesn't swap mid-roll.
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(() => {
    root.classList.add('ready')
    requestAnimationFrame(frame)
  })

  function reveal() {
    const tl = gsap.timeline({ onComplete: finish })
    const on = { '--in': 0.45, opacity: 1 }
    const off = { '--in': 1, opacity: 0.12 }

    // 1. Counter and UI leave.
    tl.to(strips, { yPercent: -12, autoAlpha: 0, duration: 0.5, ease: 'power3.in', stagger: 0.05 })
      .to(count.querySelector('sup'), { autoAlpha: 0, duration: 0.3 }, '<')
      .to(root.querySelectorAll('.loader-tag, .loader-coords, .loader-mark'), { autoAlpha: 0, duration: 0.4 }, '<')
      .to(line, { scaleX: 0, transformOrigin: 'right', duration: 0.6, ease: 'power3.inOut' }, '<')

    if (reduced) {
      tl.to(veil, { autoAlpha: 0, duration: 0.6 }).to(glow, { autoAlpha: 0, duration: 0.6 }, '<')
      buildHero(tl, '<0.2')
      return
    }

    // 2. The lamp stutters on like a fluorescent tube.
    tl.set(veil, { '--r': 34 })
    const flicker = [
      [0.15, on],
      [0.06, off],
      [0.1, on],
      [0.05, off],
      [0.24, on],
      [0.04, { '--in': 0.7, opacity: 0.5 }],
      [0.05, on],
    ]
    flicker.forEach(([gap, s]) => {
      tl.set(veil, { '--in': s['--in'] }, `+=${gap}`).set(glow, { opacity: s.opacity, scale: 1 }, '<')
    })

    // 3. Hold on the pool of light, then it floods the garage.
    tl.to(veil, { '--in': 0.32, duration: 0.5, ease: 'sine.inOut' })
      .addLabel('flood')
      .to(veil, { '--r': 300, '--in': 0, duration: 1.8, ease: 'power3.inOut' }, 'flood')
      .fromTo(film, { scale: 1.07 }, { scale: 1, duration: 2.6, ease: 'power2.out', clearProps: 'transform' }, 'flood')
      .to(glow, { opacity: 0, scale: 1.6, duration: 1.4, ease: 'power2.inOut' }, 'flood+=0.6')
    buildHero(tl, 'flood+=0.9')
  }

  function buildHero(tl, at) {
    tl.to(lines, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, at)
      .to(heroBits, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'all' }, '<0.3')
      .to('#nav', { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', clearProps: 'all' }, '<')
      .to(chrome, { filter: 'opacity(1)', duration: 0.9, ease: 'power2.out', clearProps: 'filter' }, '<0.2')
  }

  function finish() {
    h1.innerHTML = h1Html
    root.remove()
    removeEventListener('resize', placeLamp)
    document.documentElement.classList.remove('is-loading')
  }
}

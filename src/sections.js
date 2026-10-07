import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initSections() {
  // Fade/rise content in as it enters.
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    })
  })

  // Slow parallax on full-bleed section backgrounds.
  gsap.utils.toArray('.section-bg img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: { trigger: img.closest('.section'), start: 'top bottom', end: 'bottom top', scrub: true },
    })
  })

  // Hobbies: panels slide in, the red elevation line draws across them.
  gsap.from('.hobby', {
    opacity: 0,
    xPercent: 12,
    stagger: 0.12,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.hobby-strip', start: 'top 75%' },
  })
  gsap.fromTo('#elevation-path', { strokeDashoffset: 1 }, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hobby-strip', start: 'top 70%', end: 'bottom 60%', scrub: 0.5 },
  })

  // Process: red timeline fills as you scroll through the steps.
  gsap.fromTo('.steps', { '--fill': 0 }, {
    '--fill': 1,
    ease: 'none',
    scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 55%', scrub: 0.5 },
  })

  // Nav: solid background after the intro, active link per section.
  const nav = document.getElementById('nav')
  const links = [...document.querySelectorAll('.nav-links a')]
  ScrollTrigger.create({
    start: () => innerHeight * 0.5,
    onToggle: (self) => nav.classList.toggle('scrolled', self.isActive),
  })
  links.forEach((a) => {
    const target = document.querySelector(a.getAttribute('href'))
    if (!target) return
    ScrollTrigger.create({
      trigger: target,
      // The terrain section belongs to Home: it's the end of the intro.
      endTrigger: target.id === 'top' ? '#digital' : target,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => self.isActive && links.forEach((l) => l.classList.toggle('active', l === a)),
    })
  })

  // Mobile menu.
  const toggle = document.getElementById('nav-toggle')
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open')
    toggle.setAttribute('aria-expanded', open)
  })
  links.forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open')
    toggle.setAttribute('aria-expanded', 'false')
  }))
}

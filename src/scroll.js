import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initScroll({ state }) {
  // Whole-page scrub drives the 3D scene.
  gsap.to(state, {
    progress: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 },
  })

  gsap.timeline({
    scrollTrigger: { trigger: '#about', start: 'top bottom', endTrigger: '#contact', end: 'center center', scrub: 1 },
  })
    .to(state, { heroX: 2, cameraZ: 8 })
    .to(state, { heroX: -2, cameraZ: 7 })
    .to(state, { heroX: 0, cameraZ: 5 })

  gsap.utils.toArray('.panel').forEach((panel) => {
    gsap.from(panel.children, {
      y: 40,
      opacity: 0,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: panel, start: 'top 75%' },
    })
  })
}

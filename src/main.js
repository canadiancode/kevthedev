import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initFilm } from './film.js'
import { initDigital } from './digital.js'
import { initSections } from './sections.js'
import { initContactForm } from './contact.js'

gsap.registerPlugin(ScrollTrigger)

document.getElementById('year').textContent = new Date().getFullYear()

initSections()
initContactForm(document.getElementById('contact-form'))
initDigital()
initFilm().then(() => ScrollTrigger.refresh())

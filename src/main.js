import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initFilm } from './film.js'
import { initDigital } from './digital.js'
import { initSections } from './sections.js'
import { initContactForm } from './contact.js'
import { initWebMCP } from './webmcp.js'

gsap.registerPlugin(ScrollTrigger)

document.getElementById('year').textContent = new Date().getFullYear()

initSections()
initContactForm(document.getElementById('contact-form'))
initWebMCP()
initDigital()
initFilm().then(() => ScrollTrigger.refresh())

import './style.css'
import { createScene } from './scene/scene.js'
import { initScroll } from './scroll.js'
import { initContactForm } from './contact.js'

document.getElementById('year').textContent = new Date().getFullYear()

const scene = createScene(document.getElementById('scene'))
initScroll(scene)
initContactForm(document.getElementById('contact-form'))

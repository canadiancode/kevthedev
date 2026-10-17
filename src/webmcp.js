// WebMCP: exposes the site to in-browser AI agents as callable tools.
// Spec: https://webmachinelearning.github.io/webmcp/ (document.modelContext);
// Chrome's early preview shipped it as navigator.modelContext.
// Content is read from the page itself so the tools never drift from what people see.
import { sendMessage } from './contact.js'

const text = (el) => el?.textContent.replace(/\s+/g, ' ').trim() ?? ''
const json = (value) => JSON.stringify(value, null, 2)

const SECTIONS = ['top', 'about', 'services', 'work', 'hobbies', 'process', 'contact']

function profile() {
  return {
    name: 'Kevin Heidema',
    brand: 'KevTheDev',
    role: 'Shopify developer and AI automation specialist',
    location: 'Surrey, BC, Canada',
    url: 'https://kevthedev.site/',
    photo: new URL('/img/kevin.jpg', location.origin).href,
    github: 'https://github.com/canadiancode',
    about: [...document.querySelectorAll('#about .section-body > p')].map(text),
    hobbies: [...document.querySelectorAll('#hobbies figcaption')].map((c) => ({
      name: text(c.querySelector('b')),
      note: text(c).replace(text(c.querySelector('b')), '').trim(),
    })),
  }
}

function services() {
  return [...document.querySelectorAll('#services .card')].map((card) => ({
    category: text(card.querySelector('h3')).replace(/^◆\s*/, ''),
    items: [...card.querySelectorAll('li')].map((li) => ({
      name: text(li.querySelector('b')),
      description: text(li).replace(text(li.querySelector('b')), '').trim(),
    })),
  }))
}

function work() {
  const projects = [...document.querySelectorAll('#work a.work-card')].map((card) => ({
    name: text(card.querySelector('h3')),
    url: card.href,
    type: text(card.querySelector('.eyebrow')).replace(/^\d+\s*/, ''),
    description: text(card.querySelector('.work-meta > p:not(.eyebrow)')),
    tags: [...card.querySelectorAll('.tags li')].map(text),
  }))
  return { projects, note: text(document.querySelector('.work-nda p:not(.eyebrow)')) }
}

const tools = [
  {
    name: 'get_profile',
    title: 'About Kevin',
    description: 'Who Kevin Heidema (KevTheDev) is: role, location, bio, photo, links and hobbies.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => json(profile()),
  },
  {
    name: 'get_services',
    title: 'Services',
    description: 'The services Kevin offers: Shopify development, AI automation and integrations, with a short description of each.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => json(services()),
  },
  {
    name: 'get_work',
    title: 'Featured work',
    description: "Kevin's featured client projects with links, descriptions and tags.",
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => json(work()),
  },
  {
    name: 'show_section',
    title: 'Show section',
    description: 'Scroll the page to a section so the visitor can see it.',
    inputSchema: {
      type: 'object',
      properties: { section: { type: 'string', enum: SECTIONS, description: 'Section to scroll to.' } },
      required: ['section'],
    },
    annotations: { readOnlyHint: true },
    execute: async ({ section }) => {
      const el = SECTIONS.includes(section) && document.getElementById(section)
      if (!el) return `Unknown section "${section}". Use one of: ${SECTIONS.join(', ')}.`
      el.scrollIntoView({ behavior: 'smooth' })
      return `Scrolled to ${section}.`
    },
  },
  {
    name: 'contact_kevin',
    title: 'Contact Kevin',
    description:
      "Send Kevin a message on the visitor's behalf (same as the contact form). Only call this when the visitor has asked to get in touch and provided their real name and email. Kevin replies by email within one business day.",
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', maxLength: 100, description: "The visitor's name." },
        email: { type: 'string', format: 'email', maxLength: 200, description: "The visitor's email, where Kevin will reply." },
        message: { type: 'string', maxLength: 5000, description: 'What the visitor wants to discuss: project, goals, timeline.' },
      },
      required: ['name', 'email', 'message'],
    },
    annotations: { consequentialHint: true },
    execute: async ({ name, email, message }) => {
      if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email ?? '') || !message?.trim()) {
        return 'A name, a valid email and a message are all required.'
      }
      await sendMessage({ name: name.trim(), email: email.trim(), message: message.trim() })
      return 'Message sent. Kevin will reply to that email within one business day.'
    },
  },
]

export function initWebMCP() {
  const modelContext = document.modelContext ?? navigator.modelContext
  if (!modelContext?.registerTool) return
  for (const tool of tools) {
    try {
      Promise.resolve(modelContext.registerTool(tool)).catch((err) => console.warn('WebMCP:', tool.name, err))
    } catch (err) {
      console.warn('WebMCP:', tool.name, err)
    }
  }
}

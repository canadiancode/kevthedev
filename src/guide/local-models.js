import './guide.css'

/* Step 1: the "do you pay for Claude or ChatGPT?" question ---------------- */

const panels = document.querySelectorAll('[data-panel]')
const answers = document.querySelectorAll('[data-answer]')
const check1 = document.querySelector('[data-check="1"]')

// Every setup-helper prompt says exactly where to paste it, based on the step 1 pick.
const HELPER_WHERE = {
  claude: 'Claude → Code tab',
  chatgpt: 'ChatGPT → Codex',
  none: 'Claude or ChatGPT',
}

// Step 3 runs in the normal chat (no computer access), because it reads strangers' web pages.
const CHAT_WHERE = {
  claude: 'Claude → normal chat',
  chatgpt: 'ChatGPT → normal chat',
  none: 'Claude or ChatGPT → normal chat',
}

function labelHelperPrompts(answer) {
  const where = HELPER_WHERE[answer] || HELPER_WHERE.none
  const chat = CHAT_WHERE[answer] || CHAT_WHERE.none
  document.querySelectorAll('[data-where="helper"] b').forEach((b) => (b.textContent = where))
  document.querySelectorAll('[data-where="chat"] b').forEach((b) => (b.textContent = chat))
}

function choose(answer, scroll = true) {
  labelHelperPrompts(answer)
  panels.forEach((p) => (p.hidden = p.dataset.panel !== answer))
  answers.forEach((b) => b.classList.toggle('is-picked', b.dataset.answer === answer))
  check1.hidden = answer === 'none'
  try {
    localStorage.setItem('kh-guide-helper', answer)
  } catch (e) {}
  if (scroll) document.querySelector(`[data-panel="${answer}"]`).scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

answers.forEach((b) => b.addEventListener('click', () => choose(b.dataset.answer)))

try {
  const saved = localStorage.getItem('kh-guide-helper')
  if (saved) choose(saved, false)
} catch (e) {}

/* Back links: return to the exact page (and scroll spot) people came from ---- */
// Came from somewhere on this site? Go back in history so the home page restores where they were.
// Came from Instagram, Google or a fresh tab? The plain href="/" takes them to the home page.

document.querySelectorAll('[data-back]').forEach((link) => {
  link.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    let fromHere = false
    try {
      const ref = document.referrer && new URL(document.referrer)
      fromHere = !!ref && ref.origin === location.origin && ref.pathname !== location.pathname
    } catch (err) {}
    if (fromHere && history.length > 1) {
      e.preventDefault()
      history.back()
    }
  })
})

/* Copy-to-clipboard for prompt boxes --------------------------------------- */

document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = document.getElementById(btn.dataset.copy).innerText
    const label = btn.textContent
    try {
      await navigator.clipboard.writeText(text)
      btn.textContent = 'Copied. Go paste it.'
    } catch (e) {
      btn.textContent = 'Copy failed, select it manually'
    }
    btn.classList.add('is-done')
    setTimeout(() => {
      btn.textContent = label
      btn.classList.remove('is-done')
    }, 2200)
  })
})

/* Long prompts start folded: show the top, expand for the rest -------------- */

document.querySelectorAll('.g-prompt.is-collapsible').forEach((fig) => {
  const btn = fig.querySelector('.g-expand')
  const label = btn.querySelector('span')
  btn.addEventListener('click', () => {
    const open = fig.classList.toggle('is-open')
    btn.setAttribute('aria-expanded', String(open))
    label.textContent = open ? 'Fold it back up' : 'Show the whole thing'
    if (!open) fig.scrollIntoView({ block: 'nearest' })
  })
})

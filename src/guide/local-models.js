import './guide.css'

/* Step 1: the "do you pay for Claude or ChatGPT?" question ---------------- */

const panels = document.querySelectorAll('[data-panel]')
const answers = document.querySelectorAll('[data-answer]')
const check1 = document.querySelector('[data-check="1"]')

function choose(answer, scroll = true) {
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

/* RAM calculator: 80% budget, 1 GB engine, context = 50% of model ----------- */

const RUNTIME_GB = 1
const GB_PER_BILLION_PARAMS = 0.6 // ~4-bit quantized weights

const verdicts = [
  [6, 'Small but scrappy. Great for quick questions, not for writing your novel.'],
  [10, 'The sweet spot for most laptops. Surprisingly capable.'],
  [20, 'Now we are cooking. Proper, useful models.'],
  [40, 'Big boy territory. You can run some seriously smart stuff.'],
  [Infinity, 'Absolute unit. You could run models most people only read about.'],
]

const out = (key) => document.querySelector(`[data-out="${key}"]`)
const fmt = (n) => `${n.toFixed(1).replace(/\.0$/, '')} GB`

function calc(ram) {
  const budget = ram * 0.8
  const model = Math.max(0, (budget - RUNTIME_GB) / 1.5)
  const context = model / 2
  const params = Math.floor(model / GB_PER_BILLION_PARAMS)
  out('budget').textContent = fmt(budget)
  out('runtime').textContent = fmt(RUNTIME_GB)
  out('model').textContent = fmt(model)
  out('context').textContent = fmt(context)
  const line = verdicts.find(([max]) => params <= max)[1]
  out('verdict').innerHTML = `Roughly up to a <b>${params}B</b> model (4-bit). ${line}`
}

const ramButtons = document.querySelectorAll('[data-ram]')
ramButtons.forEach((b) =>
  b.addEventListener('click', () => {
    ramButtons.forEach((x) => x.setAttribute('aria-checked', String(x === b)))
    calc(Number(b.dataset.ram))
  }),
)
ramButtons.forEach((b) => b.setAttribute('role', 'radio'))
ramButtons.forEach((b) => b.hasAttribute('aria-checked') || b.setAttribute('aria-checked', 'false'))
calc(16)

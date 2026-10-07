export function initContactForm(form) {
  const status = form.querySelector('.form-status')
  const button = form.querySelector('button[type="submit"]')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    button.disabled = true
    status.textContent = 'Sending…'
    status.dataset.state = ''

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')

      form.reset()
      status.textContent = "Thanks — your message is on its way. I'll reply within one business day."
      status.dataset.state = 'ok'
    } catch (err) {
      status.textContent = err.message
      status.dataset.state = 'error'
    } finally {
      button.disabled = false
    }
  })
}

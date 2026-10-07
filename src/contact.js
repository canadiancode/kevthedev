// Contact form → Web3Forms → heidemakevin@gmail.com. No server code needed.
// The access key is public by design (it's an alias for the inbox, not a secret).
// Get one at https://web3forms.com by entering the destination email.
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || ''

export function initContactForm(form) {
  const status = form.querySelector('.form-status')
  const button = form.querySelector('button[type="submit"]')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const data = Object.fromEntries(new FormData(form))
    // Honeypot: real visitors never fill this hidden field.
    if (data.company) return

    if (!WEB3FORMS_KEY) {
      setStatus('Contact form is not configured yet.', 'error')
      return
    }

    button.disabled = true
    setStatus('Sending…', '')

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New message from ${data.name} via kevthedev.site`,
          from_name: 'kevthedev.site',
          name: data.name,
          email: data.email,
          replyto: data.email,
          message: data.message,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) throw new Error(json.message || 'Could not send your message. Please try again.')

      form.reset()
      setStatus("Thanks — your message is on its way. I'll reply within one business day.", 'ok')
    } catch (err) {
      setStatus(err.message, 'error')
    } finally {
      button.disabled = false
    }
  })

  function setStatus(text, state) {
    status.textContent = text
    status.dataset.state = state
  }
}

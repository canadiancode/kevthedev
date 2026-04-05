import { useState, type FormEvent } from 'react'
import { SectionReveal } from '@/components/motion/SectionReveal'
import { site } from '@/content/site'

const apiUrl =
  import.meta.env.VITE_CONTACT_API_URL?.trim() || '/api/contact'

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const name = String(fd.get('name') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const body = String(fd.get('message') ?? '').trim()
    const hp = String(fd.get('company') ?? '').trim()

    setStatus('sending')
    setMessage('')

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: body, company: hp || undefined }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Try email instead.')
        return
      }

      setStatus('ok')
      setMessage('Thanks — your message is on its way.')
      form.reset()
    } catch {
      setStatus('error')
      setMessage('Network error. Try again or email directly.')
    }
  }

  return (
    <SectionReveal id="contact" className="section" aria-labelledby="contact-title">
      <h2 id="contact-title" className="section__title">
        {site.contact.title}
      </h2>
      <p className="section__lead">{site.contact.intro}</p>
      <p className="contact__email">
        <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
      </p>
      <p className="section__lead" style={{ marginTop: 'var(--space-4)' }}>
        {site.contact.note}
      </p>

      <form className="form" onSubmit={onSubmit} noValidate>
        <label htmlFor="contact-name">
          Name
          <input id="contact-name" name="name" type="text" autoComplete="name" required />
        </label>
        <label htmlFor="contact-email">
          Email
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <label htmlFor="contact-message">
          Message
          <textarea id="contact-message" name="message" required />
        </label>
        <label className="form__hp" htmlFor="contact-company" aria-hidden="true">
          Company
          <input
            id="contact-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
        <button className="button" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        {message ? (
          <p
            className={`form__status form__status--${status === 'ok' ? 'ok' : 'error'}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </form>
    </SectionReveal>
  )
}

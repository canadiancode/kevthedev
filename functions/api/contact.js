// POST /api/contact — sends the contact form to email via Resend.
// Secrets live in Cloudflare Pages → Settings → Variables and secrets (see .env.example).

const LIMITS = { name: 100, email: 200, message: 5000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const json = (body, status = 200) => Response.json(body, { status })

export async function onRequestPost({ request, env }) {
  let data
  try {
    const type = request.headers.get('content-type') || ''
    data = type.includes('application/json')
      ? await request.json()
      : Object.fromEntries(await request.formData())
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }

  // Honeypot: real visitors never fill this hidden field.
  if (data.company) return json({ ok: true })

  const name = String(data.name ?? '').trim()
  const email = String(data.email ?? '').trim()
  const message = String(data.message ?? '').trim()

  if (!name || !email || !message) {
    return json({ error: 'Name, email, and message are required.' }, 400)
  }
  if (!EMAIL_RE.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400)
  }
  if (name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message) {
    return json({ error: 'One of the fields is too long.' }, 400)
  }

  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set')
    return json({ error: 'Contact form is not configured yet.' }, 500)
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || 'KevTheDev <onboarding@resend.dev>',
      to: [env.CONTACT_TO_EMAIL || 'heidemakevin@gmail.com'],
      reply_to: email,
      subject: `New message from ${name.replace(/[\r\n]+/g, ' ')} via kevthedev.site`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  })

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text())
    return json({ error: 'Could not send your message. Please try again.' }, 502)
  }

  return json({ ok: true })
}

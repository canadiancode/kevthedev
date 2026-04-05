/// <reference types="@cloudflare/workers-types" />

interface Env {
  RESEND_API_KEY: string
  CONTACT_TO_EMAIL?: string
  RESEND_FROM?: string
}

type ContactPayload = {
  name?: string
  email?: string
  message?: string
  company?: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let payload: ContactPayload
  try {
    payload = (await context.request.json()) as ContactPayload
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.company) {
    return Response.json({ ok: true })
  }

  const name = payload.name?.trim()
  const email = payload.email?.trim()
  const message = payload.message?.trim()

  if (!name || !email || !message) {
    return Response.json({ error: 'Name, email, and message are required.' }, { status: 400 })
  }

  const key = context.env.RESEND_API_KEY
  if (!key) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const to = context.env.CONTACT_TO_EMAIL ?? 'kevin@kevthedev.site'
  const from = context.env.RESEND_FROM ?? 'Portfolio <onboarding@resend.dev>'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Portfolio contact from ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Resend error', res.status, errText)
    return Response.json({ error: 'Failed to send message.' }, { status: 502 })
  }

  return Response.json({ ok: true })
}

// CommonJS per Netlify Functions
// npm i resend
const { Resend } = require('resend')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed' })
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    const message = (body.message || '').trim()
    const website = (body.website || '').trim() // honeypot

    // Anti-spam & validazione
    if (website) return json(200, { ok: true }) // ignora bot ma rispondi 200
    if (!name || !email || !message) return json(400, { ok: false, error: 'Missing fields' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { ok: false, error: 'Invalid email' })

    const resend = new Resend(process.env.RESEND_API_KEY)
    const TO   = process.env.CONTACT_TO
    const FROM = process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>'

    const subject = `Nuova richiesta dal portfolio — ${name}`
    const html = `
      <table style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:640px;width:100%;border-collapse:collapse">
        <tr><td style="padding:16px 0;font-size:18px;font-weight:800">Nuovo contatto</td></tr>
        <tr><td style="padding:8px 0"><b>Nome:</b> ${e(name)}</td></tr>
        <tr><td style="padding:8px 0"><b>Email:</b> ${e(email)}</td></tr>
        <tr><td style="padding:8px 0"><b>Messaggio:</b><br>${e(message).replace(/\n/g,'<br>')}</td></tr>
      </table>
    `

    await resend.emails.send({
      from: FROM,
      to: TO,
      reply_to: email, // ok per Resend
      subject,
      html
    })

    return json(200, { ok: true })
  } catch (err) {
    console.error(err)
    return json(500, { ok: false, error: 'Server error' })
  }
}

// Helpers
const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})
const e = (s='') => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))

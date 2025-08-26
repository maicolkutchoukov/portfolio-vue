// netlify/functions/contact.mjs
import { Resend } from 'resend'

export async function handler(event) {
  const headers = { 'Content-Type': 'application/json' }

  if (event.httpMethod !== 'POST') {
    return res(405, { ok: false, error: 'Method not allowed' }, headers)
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    const message = (body.message || '').trim()
    const website = (body.website || '').trim() // honeypot

    // Anti-spam & validazione
    if (website) return res(200, { ok: true }, headers) // ignora bot ma 200
    if (!name || !email || !message) {
      return res(400, { ok: false, error: 'Compila tutti i campi.' }, headers)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res(400, { ok: false, error: 'Email non valida.' }, headers)
    }

    const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim()
    const FROM = (process.env.CONTACT_FROM || '').trim()
    const TO_RAW = (process.env.CONTACT_TO || '').trim()

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY mancante')
      return res(500, { ok: false, error: 'Misconfigurazione server (API KEY).' }, headers)
    }
    if (!FROM) {
      console.error('CONTACT_FROM mancante: usa un indirizzo del dominio verificato Resend.')
      return res(500, { ok: false, error: 'Mittente non configurato.' }, headers)
    }
    if (!TO_RAW) {
      console.error('CONTACT_TO mancante')
      return res(500, { ok: false, error: 'Destinatario non configurato.' }, headers)
    }

    const TO = TO_RAW.split(',').map(s => s.trim()).filter(Boolean)
    const resend = new Resend(RESEND_API_KEY)

    const subject = `Nuova richiesta dal portfolio — ${name}`
    const html = `
      <table style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:640px;width:100%;border-collapse:collapse">
        <tr><td style="padding:16px 0;font-size:18px;font-weight:800">Nuovo contatto</td></tr>
        <tr><td style="padding:8px 0"><b>Nome:</b> ${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px 0"><b>Email:</b> ${escapeHtml(email)}</td></tr>
        <tr><td style="padding:8px 0"><b>Messaggio:</b><br>${escapeHtml(message).replace(/\n/g,'<br>')}</td></tr>
      </table>
    `
    const text = `Nuovo contatto
- Nome: ${name}
- Email: ${email}

Messaggio:
${message}`

    // (Opzionale) DRY RUN per testare UI senza inviare email
    if (process.env.DRY_RUN === 'true') {
      console.log('[DRY_RUN] Email non inviata. Payload:', { from: FROM, to: TO, subject })
      return res(200, { ok: true, id: 'dry_run_email_id' }, headers)
    }

    const result = await resend.emails.send({
      from: FROM,             // deve essere del dominio verificato
      to: TO,                 // array di destinatari
      reply_to: email,        // ok per Resend
      subject,
      html,
      text
    })

    console.log('Resend result:', {
      data: result?.data,
      error: result?.error,
      from: FROM,
      to: TO
    })

    if (result?.error) {
      // Errori tipici: "Domain not verified", "Address suppressed", "Invalid From", etc.
      return res(502, { ok: false, error: `Errore provider email: ${result.error?.message || 'unknown'}` }, headers)
    }

    const id = result?.data?.id || null
    return res(200, { ok: true, id }, headers)

  } catch (err) {
    console.error('Function error:', err)
    return res(500, { ok: false, error: 'Errore server.' }, headers)
  }
}

function res(statusCode, body, headers) {
  return { statusCode, headers, body: JSON.stringify(body) }
}
function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]))
}

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req, res) => {
  try {
    const body = await req.json();
    const { name, email, message, website } = body;

    // Honeypot anti-spam
    if (website) {
      return res.status(400).json({ ok: false, error: 'Bot detected' });
    }

    // Invia l’email con Resend
    await resend.emails.send({
      from: 'Portfolio <noreply@codemk.dev>', // ⚡ usa il tuo dominio verificato
      to: 'maicol.ktc@gmail.com',            // la tua casella reale
      subject: `Nuova richiesta da ${name}`,
      reply_to: email,
      text: `Hai ricevuto un messaggio da ${name} (${email}):\n\n${message}`
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

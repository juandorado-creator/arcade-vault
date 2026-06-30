import { Resend } from 'resend';
import { NextRequest } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { name, email, msg } = await request.json();

  if (!name || !email || !msg) {
    return Response.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.CONTACT_EMAIL!,
      subject: `Mensaje de contacto de ${name}`,
      html: `<p><strong>Nombre:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Mensaje:</strong> ${msg}</p>`,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Error al enviar el correo. Intenta de nuevo.' }, { status: 500 });
  }
}

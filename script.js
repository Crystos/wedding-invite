import { Resend } from 'resend';

// Инициализация клиента
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, phone, email, plus_name, plus_phone, plus_email, pdfAttachment } = req.body;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TG_CHAT = process.env.TELEGRAM_CHAT_ID;

  // 1️⃣ Уведомление в Telegram (не блокирует основной ответ)
  if (TG_TOKEN && TG_CHAT) {
    const msg = `🖤 Новый гость\n👤 ${name}\n📞 ${phone}\n📧 ${email}\n${plus_name ? `➕ ${plus_name}` : '❌ Без +1'}`;
    fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text: msg })
    }).catch(err => console.error('⚠️ Telegram notify failed:', err.message));
  }

  // 2️⃣ Шаблон письма
  const html = `
<div style="background:#050505;color:#e0e0e0;padding:40px 20px;font-family:'Helvetica Neue',sans-serif;max-width:600px;margin:auto;border:1px solid #222;">
  <h1 style="text-align:center;font-weight:300;letter-spacing:4px;margin:0 0 30px;">∞</h1>
  <p style="font-size:16px;line-height:1.6;">Уважаемый(ая) <strong style="color:#fff;">${name}</strong>,</p>
  <p style="font-size:15px;line-height:1.6;opacity:0.9;">
    Ждём вас <strong>14 августа 2026</strong> в <strong>19:00</strong><br>
    📍 Место: Пермь, загородный клуб "Тёрн"<br>
    👗 Дресс-код: <em>Total Black</em>
  </p>
  ${plus_name ? `<p style="font-size:15px;opacity:0.9;margin-top:10px;">✨ Гость +1: <strong>${plus_name}</strong></p>` : ''}
  <hr style="border:0;border-top:1px solid #333;margin:25px 0;">
  <p style="text-align:center;font-size:12px;opacity:0.5;margin-top:30px;">Игорь & Светлана • 2026</p>
</div>`;

  // 3️⃣ Отправка через Resend
  try {
    const attachments = [];
    if (pdfAttachment) attachments.push({ filename: 'invitation.pdf', content: Buffer.from(pdfAttachment, 'base64') });

    const payload = {
      from: 'Свадьба <onboarding@resend.dev>',
      to: [email],
      subject: `Приглашение на 14.08.2026`,
      html,
      attachments
    };

    // Добавляем копию админу ТОЛЬКО если адрес валидный
    if (ADMIN_EMAIL && ADMIN_EMAIL.includes('@')) {
      payload.cc = [ADMIN_EMAIL];
    } else {
      console.warn('⚠️ ADMIN_EMAIL не задан или некорректен в Vercel Env Vars');
    }

    await resend.emails.send(payload);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ Resend Error:', err.message);
    // Возвращаем понятную ошибку для фронтенда
    res.status(500).json({ error: 'Send failed', details: err.message });
  }
}
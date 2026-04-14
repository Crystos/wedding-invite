import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT = process.env.TELEGRAM_CHAT_ID;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { name, phone, email, plus_name, plus_phone, pdfAttachment } = req.body;

    // 4. Уведомление в Telegram
    if (TG_TOKEN && TG_CHAT) {
        const msg = `🖤 Новая RSVP\n👤 ${name}\n📞 ${phone}\n📧 ${email}\n${plus_name ? `➕ ${plus_name}` : '❌ Без +1'}`;
        fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TG_CHAT, text: msg })
        }).catch(console.warn);
    }

    const html = `
        <div style="background:#050505;color:#e0e0e0;padding:40px 20px;font-family:'Helvetica Neue',sans-serif;max-width:600px;margin:auto;border:1px solid #222;">
            <h1 style="text-align:center;font-weight:300;letter-spacing:4px;margin:0 0 30px;">∞</h1>
            <p style="font-size:16px;line-height:1.6;">Уважаемый(ая) <strong style="color:#fff;">${name}</strong>,</p>
            <p style="font-size:15px;line-height:1.6;opacity:0.9;">
                Ждём вас <strong>14 августа 2026</strong> в <strong>19:00</strong><br>
                📍 Место: [Ваш Адрес Площадки]<br>
                👗 Дресс-код: <em>total black</em>
            </p>
            ${plus_name ? `<p style="font-size:15px;opacity:0.9;margin-top:10px;">✨ Гость +1: <strong>${plus_name}</strong></p>` : ''}
            <hr style="border:0;border-top:1px solid #333;margin:25px 0;">
            <p style="text-align:center;font-size:12px;opacity:0.5;margin-top:30px;">Игорь & Светлана • 2026</p>
        </div>
    `;

    try {
        const attachments = [];
        if (pdfAttachment) attachments.push({ filename: 'invitation.pdf', content: Buffer.from(pdfAttachment, 'base64') });

        await resend.emails.send({
            from: 'Свадьба <noreply@resend.dev>', // замените после верификации домена
            to: [email, ADMIN_EMAIL],
            subject: `Приглашение на 14.08.2026`,
            html,
            attachments
        });
        res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Resend Error:', err);
        res.status(500).json({ error: 'Send failed' });
    }
}
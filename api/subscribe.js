const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'ah@aaronhanson.com').split(',').map(e => e.trim());

async function notifyAdmin(email) {
  if (!RESEND_API_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HabitWager <notifications@habitwager.com>',
        to: ADMIN_EMAILS,
        subject: `New waitlist signup: ${email}`,
        text: `${email} just joined the HabitWager waitlist.\n\nTime: ${new Date().toISOString()}`,
      }),
    });
  } catch (err) {
    console.error('[NOTIFY] Failed to send admin email:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = (req.body?.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required.' });
  }

  console.log(`[SUBSCRIBE] ${email}`);
  res.json({ ok: true });
  notifyAdmin(email);
}

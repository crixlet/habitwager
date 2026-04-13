const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SUBS_FILE = path.join(__dirname, 'subscribers.json');
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'ah@aaronhanson.com').split(',').map(e => e.trim());

async function notifyAdmin(email, totalCount) {
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
        subject: `New waitlist signup (#${totalCount}): ${email}`,
        text: `${email} just joined the HabitWager waitlist.\n\nTotal subscribers: ${totalCount}\nTime: ${new Date().toISOString()}`,
      }),
    });
  } catch (err) {
    console.error('[NOTIFY] Failed to send admin email:', err.message);
  }
}

// Load existing subscribers
let subscribers = [];
try {
  subscribers = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
} catch { /* first run */ }

function save() {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subscribers, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/subscribe', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required.' });
  }
  if (subscribers.some(s => s.email === email)) {
    return res.json({ ok: true, message: 'Already on the list.' });
  }
  const entry = { email, ts: new Date().toISOString() };
  subscribers.push(entry);
  save();
  console.log(`[SUBSCRIBE] ${email} (total: ${subscribers.length})`);
  res.json({ ok: true });
  notifyAdmin(email, subscribers.length);
});

// Simple admin view — protect with a token in prod if needed
app.get('/subscribers', (req, res) => {
  const token = req.query.token;
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ count: subscribers.length, subscribers });
});

app.listen(PORT, () => {
  console.log(`HabitWager landing running on :${PORT} (${subscribers.length} subscribers)`);
});

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SUBS_FILE = path.join(__dirname, 'subscribers.json');

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

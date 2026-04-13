# HabitWager Landing Pages

## Project Structure

- `public/` — Static HTML landing pages served by Vercel
  - `index.html` — Main landing page (habitwager.vercel.app)
  - `coaches.html`, `affiliates.html`, etc. — Audience-specific pages
- `api/subscribe.js` — Vercel serverless function for email waitlist signups
- `vercel.json` — Routing config (clean URLs, rewrites)
- `.github/workflows/deploy.yml` — Auto-deploys to Vercel on push to main

## Deployment

**Auto-deploy**: Push to `main` → GitHub Action deploys to Vercel production.

Pages are live at `https://habitwager.vercel.app`. Clean URLs:
- `/coaches` → `coaches.html`
- `/affiliates` → `affiliates.html`
- `/yc-founders` → `yc-founders.html`
- `/funded-founders` → `funded-founders.html`
- `/course-creators` → `course-creators.html`
- `/challenge-influencers` → `challenge-influencers.html`

## Adding a New Landing Page

1. Create `public/<page-name>.html` (self-contained HTML, inline styles)
2. Add a rewrite in `vercel.json`:
   ```json
   { "source": "/<page-name>", "destination": "/<page-name>.html" }
   ```
3. Commit and push to `main` — it auto-deploys

## Editing Pages

All landing pages are self-contained HTML files in `public/`. Edit the HTML directly. Changes go live automatically on push to main.

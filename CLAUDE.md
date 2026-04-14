# HabitWager Landing Pages

Static HTML landing pages for audience-specific outreach. Separate from the main HabitWager Rails app.

## Project Structure

- `public/` — Static HTML landing pages deployed via GitHub Pages
  - `index.html` — Main landing page
  - `coaches.html`, `affiliates.html`, etc. — Audience-specific pages

## Deployment

**Auto-deploy**: Push to `main` → GitHub Actions deploys `public/` to GitHub Pages.

Live at: `https://go.habitwager.com/`

Pages use `.html` extension in URLs:
- `/coaches.html`
- `/affiliates.html`
- `/yc-founders.html`
- `/funded-founders.html`
- `/course-creators.html`
- `/challenge-influencers.html`

## Adding a New Landing Page

1. Create `public/<page-name>.html` (self-contained HTML, inline styles)
2. Commit and push to `main` — it auto-deploys

## Editing Pages

All landing pages are self-contained HTML files in `public/`. Edit the HTML directly. Changes go live automatically on push to main.

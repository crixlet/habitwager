# HabitWager: StickK Clone with MacroFactor Branding

## Context

Megan wants something to push to affiliates today. The full Stake app isn't ready yet, so we're building a simpler StickK-style commitment contract app at habitwager.com. Users commit to habits, stake money, and lose it if they fail. Once users come in through this, they migrate to the full app later.

**Repo:** https://github.com/crixlet/habitwager (currently a Node/Express landing page — will be replaced with Rails)
**Reference app:** `/Users/aaronhanson/Documents/AOS/projects/personal/challenge-businesses/megan-aaron-prototype` (the "Stake" app)

## Decisions

| Decision | Choice |
|---|---|
| Stakes mechanic | Lose to the house (HabitWager keeps forfeited money) |
| Auth | Magic link (email only, no passwords) |
| Payment timing | Card on file via Stripe SetupIntent, charge only on failure |
| Win outcome | Complete = never charged. Fail = charged per missed day |
| Challenge structure | Single or multi-habit per challenge (user's choice) |
| Verification | Honor system, admin monitors and intervenes |
| Admin | Full management: users, challenges, charges, refunds |
| Leaderboard | Public (no auth required) — marketing tool |
| Branding | Blend of Overlord (dark surveillance vibe), StickK (commitment contracts), MacroFactor (clean modern design). Never use "overload" or "overlord" language directly — let the tone speak through design and copy |
| Deploy | Railway + PostgreSQL |

## Tech Stack

Same as the Stake app minus AI:
- Rails 8.0.4 + Ruby 3.2.x + PostgreSQL
- Hotwire (Turbo + Stimulus) + Tailwind CSS + ImportMap + Propshaft
- Stripe v19.0 (SetupIntent for cards, PaymentIntents for charges)
- SolidQueue (background jobs for daily charges/reminders)
- Resend (magic link emails + reminders)
- dotenv-rails for env vars
- **No bcrypt** (magic link, no passwords)
- **No anthropic gem** (no AI features)

## Schema

**users** — email_address, name, admin (bool), magic_token, magic_token_sent_at, stripe_customer_id, stripe_payment_method_id

**sessions** — user_id, ip_address, user_agent (identical to Stake)

**challenges** — user_id, name, duration_days, daily_stake_cents, start_date, end_date, status (identical to Stake)

**habits** — challenge_id, name, habit_type (good/bad), days_of_week, description (identical to Stake)

**check_ins** — habit_id, user_id, date, completed. Unique on (habit_id, user_id, date)

**charges** — user_id, challenge_id, date, amount_cents, stripe_payment_intent_id, reason, status (succeeded/failed/refunded). Unique on (challenge_id, date)

## Routes

```
# Magic link auth
GET/POST  /login          → magic_sessions#new/create
GET       /auth/verify    → magic_sessions#verify
GET       /auth/sent      → magic_sessions#check_email
DELETE    /logout          → magic_sessions#destroy

# Core
GET/POST  /challenges/new  → challenges#new/create
GET       /challenges/:id  → challenges#show
POST      /check_ins       → check_ins#create
DELETE    /check_ins/:id   → check_ins#destroy
GET       /dashboard       → dashboard#show
GET       /leaderboard     → leaderboard#show
GET       /billing/new     → billing#new
POST      /billing/complete → billing#complete

# Admin
GET       /admin           → admin/dashboard#show
           /admin/users     → CRUD
           /admin/challenges → CRUD
           /admin/charges   → index/show + refund action

# Landing + health
GET       /                → landing#show
GET       /up              → health check
```

## Files to Copy from Stake (adapt, don't use AI parts)

| File | Copy from Stake? | Changes needed |
|---|---|---|
| `concerns/authentication.rb` | Verbatim | None |
| `models/current.rb` | Verbatim | None |
| `models/session.rb` | Verbatim | None |
| `models/challenge.rb` | Adapt | Remove chat history dependency |
| `models/habit.rb` | Verbatim | None |
| `models/check_in.rb` | Verbatim | None |
| `models/charge.rb` | Adapt | Add status field |
| `billing_controller.rb` | Verbatim | None |
| `check_ins_controller.rb` | Verbatim | None |
| `dashboard_controller.rb` | Adapt | Remove AI chat references |
| `leaderboard_controller.rb` | Verbatim | None |
| `jobs/charge_missed_days_job.rb` | Verbatim | None |
| `jobs/expire_challenges_job.rb` | Verbatim | None |
| `initializers/stripe.rb` | Verbatim | None |
| `config/recurring.yml` | Verbatim | None |
| `Procfile` | Verbatim | None |

## New Files (not in Stake)

- `magic_sessions_controller.rb` — magic link auth flow
- `auth_mailer.rb` — sends magic link emails
- `challenges_controller.rb` — simple form (replaces AI chat)
- `add_habit_controller.js` — Stimulus controller for dynamic habit rows in form
- `admin/` namespace — dashboard, users, challenges, charges controllers + views

## Implementation Phases

### Phase 1: Foundation
- Clean Node files, generate Rails 8 app in-place
- Gemfile, database.yml, application.rb setup
- Migrations for all tables
- Tailwind theme (dark, MacroFactor-inspired, purple accent)
- Application layout with nav + flash messages
- Landing page

### Phase 2: Auth
- User model (magic_token fields, admin flag, no password)
- Session + Current models (copy from Stake)
- Authentication concern (copy from Stake)
- MagicSessionsController (new/create/verify/destroy)
- AuthMailer + magic link email template
- Login + check_email views

### Phase 3: Challenge Creation
- Challenge + Habit models (copy from Stake)
- ChallengesController with simple form
- Nested habit fields with Stimulus add/remove
- Validation: 1-5 habits, 1-365 days, stake > 0

### Phase 4: Dashboard + Check-ins
- CheckIn model (copy from Stake)
- CheckInsController (copy from Stake)
- DashboardController (adapt from Stake)
- Dashboard view: stats, day grid, habit check-in buttons, charge history

### Phase 5: Stripe + Billing
- Stripe initializer (copy from Stake)
- BillingController (copy from Stake)
- Billing view with Stripe Elements
- Charge model with status field

### Phase 6: Background Jobs
- ChargeMissedDaysJob, ExpireChallengesJob, SendDailyRemindersJob (copy from Stake)
- ChallengeMailer for reminders
- SolidQueue recurring.yml config

### Phase 7: Leaderboard
- LeaderboardController (copy from Stake, allow_unauthenticated_access)
- Public leaderboard view

### Phase 8: Admin Panel
- Admin namespace with require_admin before_action
- Admin::DashboardController (stats overview)
- Admin::UsersController (list, view, edit, toggle admin, ban)
- Admin::ChallengesController (list, view, resolve, cancel)
- Admin::ChargesController (list, view, refund via Stripe)

### Phase 9: Polish + Deploy
- Accountability-forward copy throughout all views (surveillance tone, never say "overload"/"overlord")
- Responsive design pass
- Rate limiting on auth + check-ins
- Procfile for Railway
- Railway project setup, env vars, deploy
- DNS: habitwager.com → Railway

## Branding Direction

Blend three influences — never reference any by name:

**Overlord influence** (tone): Dark, surveillance-as-motivation energy. The app feels like it's watching you. Confrontational but fun. CRT/terminal aesthetic touches (scanlines, monospace accents, neon green glow). The vibe of being held accountable by something bigger.

**StickK influence** (mechanics): Commitment contract language. "Put your money where your mouth is." The psychology of loss aversion and skin in the game.

**MacroFactor influence** (design): Clean, modern, data-forward UI. Dark backgrounds but polished — not raw/gritty. Good typography hierarchy. Feels premium, not scrappy.

**Copy tone examples** (never say "overload" or "overlord"):
- Dashboard header: "WE'RE WATCHING" (small, dim, atmospheric)
- Check-in button: "CONFIRM COMPLIANCE"
- Missed day: "COMMITMENT BROKEN. $5.00 FORFEITED."
- Streak counter: "DAYS OF COMPLIANCE"
- Challenge creation: "FILE YOUR COMMITMENT"
- Leaderboard: "COMPLIANCE RANKINGS"
- Landing hero: "Put your money where your habits are."
- Reminder email: "Your commitment is waiting. $5 is on the line."

**Visual palette:**
- Backgrounds: near-black (#0A0A0A, #141414)
- Accent: neon green (#00ee77) for success/compliance
- Danger: red (#EF4444) for failures/charges
- Secondary accent: amber (#F59E0B) for stakes/money
- Text: clean white/gray hierarchy
- Monospace font for data/numbers (JetBrains Mono)
- Clean sans-serif for body (Inter)
- Subtle scanline or grid overlay on hero sections only (not everywhere)

## Verification

1. `rails db:migrate` succeeds, schema matches plan
2. Magic link flow: enter email → receive email → click link → logged in
3. Create challenge with 2 habits → appears on dashboard
4. Check in to habits → streak increments
5. Miss a day → ChargeMissedDaysJob charges via Stripe (test mode)
6. Leaderboard loads without auth, shows active challenges
7. Admin panel: login as admin, view users/challenges, refund a charge
8. Railway deploy: health check passes, all routes work

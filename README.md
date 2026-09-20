# Ember — starter repo

Next.js (App Router, TypeScript) wired up with Supabase for auth and
data. This covers the **Foundations**, **Auth & accounts**, and
**Database & data migration** phases from the build tracker. Reminders
(WhatsApp/SMS) are deliberately not built yet — see "About the
Reminders seam" below.

## 1. Set up Supabase

1. Create a project at [database.new](https://database.new).
2. In the SQL editor, run `supabase/migrations/0001_init.sql`, then
   `0002_seed_default_chores.sql`. Together these create every table
   (profiles, chores, todos, meal_plan, groceries, events,
   affirmation_entries), turn on row-level security so each person only
   ever sees their own rows, and set up a trigger that creates a
   profile — plus a starter chore list for homemaker sign-ups —
   automatically when someone signs up.
3. From the project's API settings, copy the **Project URL** and
   **Publishable key** (also labelled `anon` key).

## 2. Configure the app

```bash
cp .env.local.example .env.local
```

Paste the two values from Supabase into `.env.local`.

## 3. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Sign up, check your email for the
confirmation link (Supabase sends this automatically), sign in, and
you'll land on the dashboard shell with real auth and a real database
behind it.

## What's here

```
app/
  page.tsx                 Landing page — hero, flavour grid, feature row
  login/, signup/           Auth forms, styled to match the prototype's paper cards
  auth/actions.ts           signIn / signUp / signOut
  auth/confirm/route.ts     Handles the email confirmation link
  dashboard/layout.tsx      Sidebar shell + protected layout — redirects to /login if signed out
  dashboard/actions.ts       Today page's add/toggle to-do actions
  dashboard/page.tsx        Today — stats, affirmation strip, live to-do list
  dashboard/chores/          Daily/weekly chores with a 7-day history strip
  dashboard/meals/           Weekly meal grid (the one page with a client component,
                              for auto-save-on-blur textareas)
  dashboard/groceries/       Add / check off / remove shopping list
  dashboard/calendar/        Month view + day panel; month/day navigation lives in
                              the URL (?year=&month=&day=), not client state
  dashboard/affirmations/    Daily affirmation + a saved reflection log
  dashboard/settings/        Account info from the profiles table
components/DashboardNav.tsx  Sidebar/mobile nav links, highlights the active tab
lib/supabase/
  client.ts                 Supabase client for Client Components (browser)
  server.ts                 Supabase client for Server Components/Actions
  proxy.ts                  Refreshes the auth session on every request
lib/dates.ts                 Shared date helpers (week/month math, formatting)
lib/affirmations.ts          The homemaker affirmation list
lib/notifications/service.ts
                             The reminder seam — see below
proxy.ts                    Wires lib/supabase/proxy.ts into Next.js
supabase/migrations/
  0001_init.sql              Full schema + row-level security policies
  0002_seed_default_chores.sql
                             Gives new homemaker sign-ups a starter chore list
```

Every page follows the same shape: the page itself is a Server Component
that queries Supabase directly (row-level security means it only ever
sees the signed-in user's rows), and every write — adding a to-do,
checking off a chore, saving an event — goes through a `"use server"`
action in that feature's `actions.ts`, called either from a plain
`<form action={...}>` or, for the meal planner's auto-saving textareas,
from one of the two client components in the app
(`meals/MealCell.tsx` and `components/DashboardNav.tsx`, the latter
only for highlighting the active sidebar tab).

## A note on `proxy.ts`

Next.js 16 renamed `middleware.ts` to `proxy.ts` (and the exported
function from `middleware` to `proxy`). This repo uses the new name. If
your Next.js version is 15 or earlier, rename `proxy.ts` to
`middleware.ts` and the function inside it to `middleware` — the
Supabase logic is identical either way. Run `npx next --version` to check.

## About the Reminders seam

Per the plan: WhatsApp/SMS reminders are deferred until there are real
sign-ups, but the architecture is ready for them without a rebuild:

- `profiles.phone_number` and `profiles.reminder_preference`, and
  `events.reminder_enabled` / `reminder_channel`, already exist in the
  schema — unused, but nothing will need a migration to add them later.
- `lib/notifications/service.ts` exports a single `sendReminder()` call.
  Today it just logs to the console. When the Reminders phase kicks
  off, swap `LoggingNotificationService` for the commented-out
  `TwilioNotificationService` in that same file — nothing that calls
  `notificationService.sendReminder()` elsewhere in the app has to change.
- The calendar page can let people set a reminder now (writing to the
  `events` table's reminder columns); it just won't send anything until
  that swap happens.

1. Run the app, sign up, and click through every page — visual design
   now matches the HTML prototype (Fraunces/Work Sans, the ink/paper
   colour system, the sidebar shell, paper cards). `components/DashboardNav.tsx`
   is a small client component that highlights the active tab.
2. Today is now a true overview: to-dos done, daily chores done, and
   events today, all as real stats pulled from their own tables, plus
   today's events listed inline with a link to the full calendar. There's
   no query that spans all of this in one round trip — it's four
   separate `.from(...)` calls in `dashboard/page.tsx` — which is fine at
   this scale but worth collapsing into a Postgres view or an RPC call
   once the dashboard has real traffic.
3. Multi-flavour expansion (Phase 3 in the tracker): the sign-up flavour
   picker exists, but only `homemaker` has real content. Each new
   flavour needs its own default-data migration (like
   `0002_seed_default_chores.sql`) and its own page content.
4. When you're ready for the deferred Reminders phase: get a Twilio
   account and WhatsApp Business approval, then follow the comments in
   `lib/notifications/service.ts`. The calendar page already saves
   `reminder_enabled` / `reminder_channel` on every event — that's the
   data the real send job will read from.

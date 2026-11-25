# Pocketwise — Expense Tracker

A personal finance dashboard built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Supabase** (auth + Postgres) and **Recharts**.

Features:

- Email/password sign up and sign in (Supabase Auth)
- Stat cards: total balance, monthly income, monthly expenses and savings, each with a small chart
- Income vs expenses line chart and monthly cash-flow bars (6 or 12 months)
- Spending breakdown donut for the current month
- Transactions table with search, type/status filters, sorting, "show more" and delete
- Monthly budgets per category with progress bars
- Add-transaction and edit-budgets dialogs
- One click to load 6 months of sample data into an empty account
- **Demo mode**: runs with generated data (read-only) when no Supabase keys are set

## Getting started

### 1. Install

```bash
npm install
```

### 2. Try the demo (optional)

```bash
npm run dev
```

Open http://localhost:3000. Without Supabase keys the dashboard shows sample data and saving is disabled.

### 3. Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql). It creates the `transactions` and `budgets` tables with row-level security, so each user only sees their own rows.
3. Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...   # the anon / publishable key
   ```

4. Restart `npm run dev`. You'll be sent to `/login`. Create an account, then use **+** to add transactions, or click **Load 6 months of sample data**.

> If email confirmation is turned on in Supabase (**Authentication → Providers → Email**), confirm your address before you sign in. Turn it off for quick local testing.

## Project structure

```
src/
  proxy.ts                     # Refreshes the Supabase session and protects routes (Next 16's "middleware")
  app/
    page.tsx                   # Dashboard: loads data on the server, streams behind <Suspense>
    actions.ts                 # Server actions: auth, add/delete transactions, budgets, sample data
    login/                     # Sign in / sign up
  components/
    ui.tsx                     # Card, Select, Modal and shared styles
    dashboard/                 # Stat cards, charts, table, budget planner, dialogs
  lib/
    supabase/                  # Supabase config and server client
    data.ts                    # Loads the user's transactions and budgets (or demo data)
    analytics.ts               # Turns transactions into the numbers shown on the dashboard
    sample-data.ts             # Seeded sample-data generator
supabase/schema.sql            # Tables and RLS policies
```

## Notes

- Failed transactions are listed but don't count toward any totals.
- Months are grouped using the server's time zone.

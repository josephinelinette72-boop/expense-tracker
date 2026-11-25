-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  category    text not null,
  type        text not null check (type in ('income', 'expense')),
  amount      numeric(12, 2) not null check (amount > 0),
  status      text not null default 'complete' check (status in ('complete', 'pending', 'failed')),
  occurred_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, occurred_at desc);

create table if not exists public.budgets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category      text not null,
  monthly_limit numeric(12, 2) not null check (monthly_limit > 0),
  created_at    timestamptz not null default now(),
  unique (user_id, category)
);

-- Row Level Security: each user can only see and change their own rows.
alter table public.transactions enable row level security;
alter table public.budgets      enable row level security;

drop policy if exists "transactions_owner" on public.transactions;
create policy "transactions_owner" on public.transactions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "budgets_owner" on public.budgets;
create policy "budgets_owner" on public.budgets
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

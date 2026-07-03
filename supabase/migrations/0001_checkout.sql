-- Checkout sessions and payments schema for VeltoPay
-- Run with: supabase db push  (or paste into the Supabase SQL editor)

create extension if not exists "pgcrypto";

create table if not exists checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null,
  merchant_name text not null default 'VeltoPay',
  status text not null default 'open'
    check (status in ('open', 'processing', 'paid', 'expired', 'canceled')),
  items jsonb not null,
  total_amount_cents integer not null check (total_amount_cents >= 0),
  allowed_payment_methods text[] not null default array['credit_card', 'debit_card', 'pix', 'boleto'],
  customer_name text,
  customer_email text,
  customer_document text,
  success_url text,
  cancel_url text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_checkout_sessions_merchant_id
  on checkout_sessions (merchant_id);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  checkout_session_id uuid not null references checkout_sessions (id) on delete cascade,
  method text not null
    check (method in ('credit_card', 'debit_card', 'pix', 'boleto')),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'approved', 'failed', 'expired')),
  provider_reference text,
  amount_cents integer not null check (amount_cents >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists idx_payments_checkout_session_id
  on payments (checkout_session_id);

alter table checkout_sessions enable row level security;
alter table payments enable row level security;

-- Checkout sessions are read via their opaque id (like a payment link),
-- so anonymous SELECT is allowed; writes go through the service role only.
create policy "Anyone can read a checkout session by id"
  on checkout_sessions for select
  using (true);

create policy "Anyone can read payments for a checkout session"
  on payments for select
  using (true);

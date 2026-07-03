begin;

create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum (
  'admin',
  'producer',
  'affiliate',
  'support'
);

create type public.user_status as enum (
  'active',
  'pending',
  'disabled'
);

create type public.producer_status as enum (
  'pending',
  'approved',
  'rejected',
  'blocked'
);

create type public.product_status as enum (
  'draft',
  'active',
  'inactive',
  'archived'
);

create type public.product_type as enum (
  'one_time'
);

create type public.checkout_status as enum (
  'draft',
  'published',
  'disabled'
);

create type public.order_status as enum (
  'pending',
  'paid',
  'failed',
  'refunded',
  'chargeback',
  'canceled',
  'expired'
);

create type public.payment_method as enum (
  'pix',
  'credit_card',
  'boleto'
);

create type public.payment_provider as enum (
  'mercadopago',
  'pagarme',
  'stripe',
  'manual'
);

create type public.payment_status as enum (
  'pending',
  'processing',
  'paid',
  'failed',
  'refunded',
  'chargeback',
  'canceled'
);

create type public.affiliate_status as enum (
  'pending',
  'approved',
  'blocked'
);

create type public.affiliate_link_status as enum (
  'active',
  'inactive'
);

create type public.commission_status as enum (
  'pending',
  'available',
  'paid',
  'canceled'
);

create type public.withdrawal_status as enum (
  'requested',
  'processing',
  'paid',
  'rejected',
  'canceled'
);

create type public.ledger_entry_type as enum (
  'sale',
  'platform_fee',
  'producer_receivable',
  'affiliate_commission',
  'withdrawal',
  'withdrawal_fee',
  'refund',
  'chargeback',
  'hold',
  'release',
  'adjustment'
);

create type public.ledger_entry_direction as enum (
  'credit',
  'debit'
);

create type public.payment_event_status as enum (
  'received',
  'processed',
  'failed'
);

create type public.outbox_event_status as enum (
  'pending',
  'processing',
  'processed',
  'failed',
  'discarded'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prevent_append_only_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception '% is append-only and cannot be changed with %', tg_table_name, tg_op
    using errcode = '25006';
end;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    'producer'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_user_role() in ('admin', 'support');
$$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'producer',
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_format_check check (position('@' in email) > 1)
);

create table public.producers (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  brand_name text,
  company_name text,
  document text unique,
  status public.producer_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.affiliates (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  status public.affiliate_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  product_type public.product_type not null default 'one_time',
  status public.product_status not null default 'draft',
  price_cents integer not null,
  currency char(3) not null default 'BRL',
  image_url text,
  delivery_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_length_check check (char_length(name) between 3 and 140),
  constraint products_slug_format_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_price_cents_check check (price_cents >= 500),
  constraint products_currency_check check (currency = upper(currency))
);

create table public.checkouts (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  slug text not null unique,
  status public.checkout_status not null default 'draft',
  headline text,
  description text,
  primary_color text,
  order_bump_enabled boolean not null default false,
  upsell_enabled boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint checkouts_slug_format_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint checkouts_primary_color_check check (
    primary_color is null or primary_color ~ '^#[0-9A-Fa-f]{6}$'
  )
);

create table public.customers (
  id uuid primary key default extensions.gen_random_uuid(),
  email text not null,
  name text not null,
  document text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_email_format_check check (position('@' in email) > 1),
  constraint customers_name_length_check check (char_length(name) >= 2)
);

create table public.affiliate_links (
  id uuid primary key default extensions.gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  producer_id uuid not null references public.producers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  code text not null unique,
  status public.affiliate_link_status not null default 'active',
  commission_rate_bps integer not null default 0,
  cookie_window_days integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint affiliate_links_code_format_check check (code ~ '^[a-zA-Z0-9_-]{4,64}$'),
  constraint affiliate_links_commission_rate_bps_check check (
    commission_rate_bps between 0 and 8000
  ),
  constraint affiliate_links_cookie_window_days_check check (
    cookie_window_days between 1 and 365
  )
);

create table public.orders (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  checkout_id uuid not null references public.checkouts(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  affiliate_id uuid references public.affiliates(id) on delete set null,
  affiliate_link_id uuid references public.affiliate_links(id) on delete set null,
  status public.order_status not null default 'pending',
  payment_method public.payment_method,
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  total_cents integer not null,
  currency char(3) not null default 'BRL',
  external_reference text unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_amounts_check check (
    subtotal_cents >= 0
    and discount_cents >= 0
    and total_cents >= 0
    and total_cents = subtotal_cents - discount_cents
  ),
  constraint orders_currency_check check (currency = upper(currency))
);

create table public.payments (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  status public.payment_status not null default 'pending',
  method public.payment_method not null,
  provider public.payment_provider not null,
  amount_cents integer not null,
  fee_cents integer not null default 0,
  net_amount_cents integer not null,
  currency char(3) not null default 'BRL',
  external_payment_id text,
  idempotency_key text unique,
  raw_provider_status text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amounts_check check (
    amount_cents >= 0
    and fee_cents >= 0
    and net_amount_cents >= 0
    and amount_cents >= fee_cents
  ),
  constraint payments_currency_check check (currency = upper(currency))
);

create table public.commissions (
  id uuid primary key default extensions.gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete set null,
  status public.commission_status not null default 'pending',
  amount_cents integer not null,
  commission_rate_bps integer not null,
  currency char(3) not null default 'BRL',
  available_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commissions_amount_cents_check check (amount_cents >= 0),
  constraint commissions_rate_bps_check check (commission_rate_bps between 0 and 8000),
  constraint commissions_currency_check check (currency = upper(currency))
);

create table public.withdrawals (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete restrict,
  status public.withdrawal_status not null default 'requested',
  amount_cents integer not null,
  fee_cents integer not null default 0,
  net_amount_cents integer not null,
  currency char(3) not null default 'BRL',
  pix_key text,
  requested_at timestamptz not null default now(),
  paid_at timestamptz,
  rejected_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint withdrawals_amounts_check check (
    amount_cents >= 5000
    and fee_cents >= 0
    and net_amount_cents >= 0
    and amount_cents >= fee_cents
  ),
  constraint withdrawals_currency_check check (currency = upper(currency))
);

create table public.ledger_entries (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete restrict,
  order_id uuid references public.orders(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete restrict,
  withdrawal_id uuid references public.withdrawals(id) on delete restrict,
  commission_id uuid references public.commissions(id) on delete restrict,
  entry_type public.ledger_entry_type not null,
  direction public.ledger_entry_direction not null,
  amount_cents integer not null,
  currency char(3) not null default 'BRL',
  description text,
  available_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ledger_entries_amount_cents_check check (amount_cents > 0),
  constraint ledger_entries_currency_check check (currency = upper(currency))
);

create table public.payment_events (
  id uuid primary key default extensions.gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete set null,
  provider public.payment_provider not null,
  external_event_id text,
  event_type text not null,
  status public.payment_event_status not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint payment_events_event_type_length_check check (char_length(event_type) >= 2)
);

create table public.outbox_events (
  id uuid primary key default extensions.gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid,
  payload jsonb not null default '{}'::jsonb,
  status public.outbox_event_status not null default 'pending',
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outbox_events_event_type_length_check check (char_length(event_type) >= 2),
  constraint outbox_events_aggregate_type_length_check check (char_length(aggregate_type) >= 2),
  constraint outbox_events_attempts_check check (attempts >= 0)
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(
      nullif(new.raw_app_meta_data ->> 'role', '')::public.user_role,
      'producer'::public.user_role
    )
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.users.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
        updated_at = now();

  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger producers_set_updated_at
before update on public.producers
for each row execute function public.set_updated_at();

create trigger affiliates_set_updated_at
before update on public.affiliates
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger checkouts_set_updated_at
before update on public.checkouts
for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger affiliate_links_set_updated_at
before update on public.affiliate_links
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger commissions_set_updated_at
before update on public.commissions
for each row execute function public.set_updated_at();

create trigger withdrawals_set_updated_at
before update on public.withdrawals
for each row execute function public.set_updated_at();

create trigger outbox_events_set_updated_at
before update on public.outbox_events
for each row execute function public.set_updated_at();

create trigger ledger_entries_prevent_update
before update or delete on public.ledger_entries
for each row execute function public.prevent_append_only_mutation();

create trigger payment_events_prevent_update
before update or delete on public.payment_events
for each row execute function public.prevent_append_only_mutation();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create unique index users_email_lower_idx on public.users (lower(email));
create index users_role_idx on public.users (role);

create index producers_user_id_idx on public.producers (user_id);
create index producers_status_idx on public.producers (status);

create index affiliates_user_id_idx on public.affiliates (user_id);
create index affiliates_status_idx on public.affiliates (status);

create unique index products_producer_slug_idx on public.products (producer_id, slug);
create index products_producer_status_idx on public.products (producer_id, status);
create index products_created_at_idx on public.products (created_at desc);

create index checkouts_product_id_idx on public.checkouts (product_id);
create index checkouts_producer_id_idx on public.checkouts (producer_id);
create index checkouts_status_idx on public.checkouts (status);

create unique index customers_email_lower_idx on public.customers (lower(email));
create index customers_document_idx on public.customers (document) where document is not null;

create index affiliate_links_affiliate_id_idx on public.affiliate_links (affiliate_id);
create index affiliate_links_product_id_idx on public.affiliate_links (product_id);
create index affiliate_links_producer_id_idx on public.affiliate_links (producer_id);
create index affiliate_links_status_idx on public.affiliate_links (status);

create index orders_producer_created_at_idx on public.orders (producer_id, created_at desc);
create index orders_customer_id_idx on public.orders (customer_id);
create index orders_product_id_idx on public.orders (product_id);
create index orders_checkout_id_idx on public.orders (checkout_id);
create index orders_status_idx on public.orders (status);

create unique index payments_provider_external_id_idx
on public.payments (provider, external_payment_id)
where external_payment_id is not null;
create index payments_order_id_idx on public.payments (order_id);
create index payments_status_idx on public.payments (status);
create index payments_created_at_idx on public.payments (created_at desc);

create index commissions_affiliate_status_idx on public.commissions (affiliate_id, status);
create index commissions_order_id_idx on public.commissions (order_id);
create index commissions_payment_id_idx on public.commissions (payment_id);

create index withdrawals_producer_status_idx on public.withdrawals (producer_id, status);
create index withdrawals_requested_at_idx on public.withdrawals (requested_at desc);

create index ledger_entries_producer_created_at_idx
on public.ledger_entries (producer_id, created_at desc);
create index ledger_entries_order_id_idx on public.ledger_entries (order_id);
create index ledger_entries_payment_id_idx on public.ledger_entries (payment_id);
create index ledger_entries_withdrawal_id_idx on public.ledger_entries (withdrawal_id);
create index ledger_entries_available_at_idx on public.ledger_entries (available_at);

create unique index payment_events_provider_external_event_id_idx
on public.payment_events (provider, external_event_id)
where external_event_id is not null;
create index payment_events_payment_id_idx on public.payment_events (payment_id);
create index payment_events_received_at_idx on public.payment_events (received_at desc);

create index outbox_events_status_available_at_idx
on public.outbox_events (status, available_at)
where status in ('pending', 'failed');
create index outbox_events_aggregate_idx on public.outbox_events (aggregate_type, aggregate_id);

alter table public.users enable row level security;
alter table public.producers enable row level security;
alter table public.affiliates enable row level security;
alter table public.products enable row level security;
alter table public.checkouts enable row level security;
alter table public.customers enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.commissions enable row level security;
alter table public.withdrawals enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.payment_events enable row level security;
alter table public.outbox_events enable row level security;

create policy "Users can view themselves"
on public.users for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "Users can update themselves"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can manage users"
on public.users for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Producers can view own producer record"
on public.producers for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users can create own producer record"
on public.producers for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

create policy "Producers can update own producer record"
on public.producers for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "Affiliates can view own affiliate record"
on public.affiliates for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users can create own affiliate record"
on public.affiliates for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

create policy "Affiliates can update own affiliate record"
on public.affiliates for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "Public can view active products"
on public.products for select
to anon, authenticated
using (status = 'active');

create policy "Producers can manage own products"
on public.products for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.producers
    where producers.id = products.producer_id
      and producers.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.producers
    where producers.id = products.producer_id
      and producers.user_id = auth.uid()
  )
);

create policy "Public can view published checkouts"
on public.checkouts for select
to anon, authenticated
using (status = 'published');

create policy "Producers can manage own checkouts"
on public.checkouts for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.producers
    where producers.id = checkouts.producer_id
      and producers.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.producers
    where producers.id = checkouts.producer_id
      and producers.user_id = auth.uid()
  )
);

create policy "Admins can manage customers"
on public.customers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can create customers"
on public.customers for insert
to anon, authenticated
with check (true);

create policy "Public can view active affiliate links"
on public.affiliate_links for select
to anon, authenticated
using (status = 'active');

create policy "Affiliates and producers can manage affiliate links"
on public.affiliate_links for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.affiliates
    where affiliates.id = affiliate_links.affiliate_id
      and affiliates.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.producers
    where producers.id = affiliate_links.producer_id
      and producers.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.affiliates
    where affiliates.id = affiliate_links.affiliate_id
      and affiliates.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.producers
    where producers.id = affiliate_links.producer_id
      and producers.user_id = auth.uid()
  )
);

create policy "Public can create pending orders"
on public.orders for insert
to anon, authenticated
with check (status = 'pending');

create policy "Producers and affiliates can view related orders"
on public.orders for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.producers
    where producers.id = orders.producer_id
      and producers.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.affiliates
    where affiliates.id = orders.affiliate_id
      and affiliates.user_id = auth.uid()
  )
);

create policy "Admins can manage orders"
on public.orders for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Producers can view related payments"
on public.payments for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders
    join public.producers on producers.id = orders.producer_id
    where orders.id = payments.order_id
      and producers.user_id = auth.uid()
  )
);

create policy "Admins can manage payments"
on public.payments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Affiliates can view own commissions"
on public.commissions for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.affiliates
    where affiliates.id = commissions.affiliate_id
      and affiliates.user_id = auth.uid()
  )
);

create policy "Admins can manage commissions"
on public.commissions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Producers can view own withdrawals"
on public.withdrawals for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.producers
    where producers.id = withdrawals.producer_id
      and producers.user_id = auth.uid()
  )
);

create policy "Producers can request own withdrawals"
on public.withdrawals for insert
to authenticated
with check (
  exists (
    select 1
    from public.producers
    where producers.id = withdrawals.producer_id
      and producers.user_id = auth.uid()
  )
);

create policy "Admins can manage withdrawals"
on public.withdrawals for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Producers can view own ledger entries"
on public.ledger_entries for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.producers
    where producers.id = ledger_entries.producer_id
      and producers.user_id = auth.uid()
  )
);

create policy "Admins can append ledger entries"
on public.ledger_entries for insert
to authenticated
with check (public.is_admin());

create policy "Admins can view payment events"
on public.payment_events for select
to authenticated
using (public.is_admin());

create policy "Admins can append payment events"
on public.payment_events for insert
to authenticated
with check (public.is_admin());

create policy "Admins can manage outbox events"
on public.outbox_events for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

commit;

begin;

do $$
begin
  if not exists (
    select 1 from pg_type
    join pg_namespace on pg_namespace.oid = pg_type.typnamespace
    where pg_namespace.nspname = 'public' and pg_type.typname = 'checkout_status'
  ) then
    create type public.checkout_status as enum ('draft', 'published', 'disabled');
  end if;

  if not exists (
    select 1 from pg_type
    join pg_namespace on pg_namespace.oid = pg_type.typnamespace
    where pg_namespace.nspname = 'public' and pg_type.typname = 'payment_method'
  ) then
    create type public.payment_method as enum ('pix', 'credit_card', 'boleto');
  end if;

  if not exists (
    select 1 from pg_type
    join pg_namespace on pg_namespace.oid = pg_type.typnamespace
    where pg_namespace.nspname = 'public' and pg_type.typname = 'payment_provider'
  ) then
    create type public.payment_provider as enum ('mercadopago', 'pagarme', 'stripe', 'manual');
  end if;

  if not exists (
    select 1 from pg_type
    join pg_namespace on pg_namespace.oid = pg_type.typnamespace
    where pg_namespace.nspname = 'public' and pg_type.typname = 'ledger_entry_type'
  ) then
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
  end if;

  if not exists (
    select 1 from pg_type
    join pg_namespace on pg_namespace.oid = pg_type.typnamespace
    where pg_namespace.nspname = 'public' and pg_type.typname = 'ledger_entry_direction'
  ) then
    create type public.ledger_entry_direction as enum ('credit', 'debit');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'slug'
  ) then
    alter table public.products add column slug text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'price_cents'
  ) then
    alter table public.products add column price_cents integer;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'price'
  ) then
    alter table public.products alter column price drop not null;
    alter table public.products alter column price set default 0;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'checkouts' and column_name = 'status'
  ) then
    alter table public.checkouts
      add column status public.checkout_status not null default 'draft'::public.checkout_status;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'checkouts' and column_name = 'published_at'
  ) then
    alter table public.checkouts add column published_at timestamptz;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'subtotal_cents'
  ) then
    alter table public.orders add column subtotal_cents integer not null default 0;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'discount_cents'
  ) then
    alter table public.orders add column discount_cents integer not null default 0;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'total_cents'
  ) then
    alter table public.orders add column total_cents integer not null default 0;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'currency'
  ) then
    alter table public.orders add column currency char(3) not null default 'BRL';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'metadata'
  ) then
    alter table public.orders add column metadata jsonb not null default '{}'::jsonb;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'method'
  ) then
    alter table public.payments add column method public.payment_method not null default 'pix'::public.payment_method;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'provider'
  ) then
    alter table public.payments add column provider public.payment_provider not null default 'manual'::public.payment_provider;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'amount_cents'
  ) then
    alter table public.payments add column amount_cents integer not null default 0;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'fee_cents'
  ) then
    alter table public.payments add column fee_cents integer not null default 0;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'net_amount_cents'
  ) then
    alter table public.payments add column net_amount_cents integer not null default 0;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'currency'
  ) then
    alter table public.payments add column currency char(3) not null default 'BRL';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'amount'
  ) then
    alter table public.payments alter column amount drop not null;
    alter table public.payments alter column amount set default 0;
  end if;
end;
$$;

with product_slugs as (
  select
    id,
    coalesce(
      nullif(trim(both '-' from regexp_replace(lower(coalesce(name, '')), '[^a-z0-9]+', '-', 'g')), ''),
      'produto'
    ) || '-' || substr(replace(id::text, '-', ''), 1, 8) as generated_slug
  from public.products
  where slug is null or slug = ''
)
update public.products
set slug = product_slugs.generated_slug
from product_slugs
where products.id = product_slugs.id;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'price'
  ) then
    update public.products
    set price_cents = case
      when price_cents is not null then price_cents
      when coalesce(price::numeric, 0) >= 1000 then round(coalesce(price::numeric, 0))::integer
      else round(coalesce(price::numeric, 0) * 100)::integer
    end;
  else
    update public.products
    set price_cents = coalesce(price_cents, 0);
  end if;
end;
$$;

alter table public.products alter column slug set not null;
alter table public.products alter column price_cents set not null;
alter table public.products alter column price_cents set default 0;

create unique index if not exists products_slug_unique_idx
on public.products (slug);

create unique index if not exists products_producer_slug_idx
on public.products (producer_id, slug);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'amount'
  ) then
    update public.payments
    set
      amount_cents = case
        when amount_cents > 0 then amount_cents
        when coalesce(amount::numeric, 0) >= 1000 then round(coalesce(amount::numeric, 0))::integer
        else round(coalesce(amount::numeric, 0) * 100)::integer
      end,
      net_amount_cents = case
        when net_amount_cents > 0 then net_amount_cents
        when coalesce(amount::numeric, 0) >= 1000 then round(coalesce(amount::numeric, 0))::integer
        else round(coalesce(amount::numeric, 0) * 100)::integer
      end;
  end if;
end;
$$;

update public.orders
set
  subtotal_cents = coalesce(nullif(subtotal_cents, 0), products.price_cents, 0),
  total_cents = coalesce(nullif(total_cents, 0), products.price_cents, 0),
  currency = coalesce(nullif(orders.currency, ''), products.currency, 'BRL')
from public.products
where products.id = orders.product_id;

create table if not exists public.ledger_entries (
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

alter table public.ledger_entries enable row level security;

drop policy if exists "Producers can view own ledger entries" on public.ledger_entries;
drop policy if exists "Admins can append ledger entries" on public.ledger_entries;

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

create index if not exists ledger_entries_producer_created_at_idx
on public.ledger_entries (producer_id, created_at desc);

grant select on table public.ledger_entries to authenticated;
grant insert on table public.ledger_entries to authenticated;
grant select on table public.orders to authenticated;
grant select on table public.payments to authenticated;
grant select on table public.customers to authenticated;

commit;

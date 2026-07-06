do $$
begin
  create type public.payment_provider as enum (
    'mercadopago',
    'pagarme',
    'stripe',
    'asaas',
    'manual'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.payment_status as enum (
    'pending',
    'processing',
    'paid',
    'authorized',
    'failed',
    'refunded',
    'chargeback',
    'canceled',
    'cancelled'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.payment_event_status as enum (
    'received',
    'processed',
    'failed'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.payment_environment as enum (
    'development',
    'sandbox',
    'production'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.transaction_type as enum (
    'payment',
    'authorization',
    'capture',
    'refund',
    'chargeback',
    'cancellation'
  );
exception
  when duplicate_object then null;
end;
$$;

alter type public.payment_provider add value if not exists 'asaas';
alter type public.payment_status add value if not exists 'authorized';
alter type public.payment_status add value if not exists 'cancelled';

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

alter table public.payments
  add column if not exists provider_environment public.payment_environment not null default 'sandbox',
  add column if not exists provider_checkout_url text,
  add column if not exists provider_reference text,
  add column if not exists provider_payload jsonb not null default '{}'::jsonb;

create table if not exists public.transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_id uuid not null references public.payments(id) on delete restrict,
  provider public.payment_provider not null,
  provider_environment public.payment_environment not null default 'sandbox',
  transaction_type public.transaction_type not null default 'payment',
  status public.payment_status not null default 'pending',
  amount_cents integer not null,
  currency char(3) not null default 'BRL',
  external_transaction_id text,
  provider_payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_amount_cents_check check (amount_cents >= 0),
  constraint transactions_currency_check check (currency = upper(currency))
);

create table if not exists public.refunds (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_id uuid not null references public.payments(id) on delete restrict,
  provider public.payment_provider not null,
  provider_environment public.payment_environment not null default 'sandbox',
  status public.payment_status not null default 'pending',
  amount_cents integer not null,
  currency char(3) not null default 'BRL',
  reason text,
  external_refund_id text,
  provider_payload jsonb not null default '{}'::jsonb,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint refunds_amount_cents_check check (amount_cents > 0),
  constraint refunds_currency_check check (currency = upper(currency))
);

create table if not exists public.webhooks (
  id uuid primary key default extensions.gen_random_uuid(),
  provider public.payment_provider not null,
  provider_environment public.payment_environment not null default 'sandbox',
  external_event_id text,
  event_type text not null,
  signature_valid boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  status public.payment_event_status not null default 'received',
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  constraint webhooks_event_type_length_check check (char_length(event_type) >= 2)
);

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

create trigger refunds_set_updated_at
before update on public.refunds
for each row execute function public.set_updated_at();

create index if not exists payments_provider_environment_idx
on public.payments (provider, provider_environment);

create index if not exists payments_provider_reference_idx
on public.payments (provider, provider_reference)
where provider_reference is not null;

create index if not exists transactions_producer_created_at_idx
on public.transactions (producer_id, created_at desc);

create index if not exists transactions_payment_id_idx
on public.transactions (payment_id);

create index if not exists transactions_order_id_idx
on public.transactions (order_id);

create unique index if not exists transactions_provider_external_id_idx
on public.transactions (provider, external_transaction_id)
where external_transaction_id is not null;

create index if not exists refunds_producer_created_at_idx
on public.refunds (producer_id, created_at desc);

create index if not exists refunds_payment_id_idx
on public.refunds (payment_id);

create index if not exists refunds_order_id_idx
on public.refunds (order_id);

create unique index if not exists refunds_provider_external_id_idx
on public.refunds (provider, external_refund_id)
where external_refund_id is not null;

create unique index if not exists webhooks_provider_external_event_id_idx
on public.webhooks (provider, external_event_id)
where external_event_id is not null;

create index if not exists webhooks_received_at_idx
on public.webhooks (received_at desc);

alter table public.transactions enable row level security;
alter table public.refunds enable row level security;
alter table public.webhooks enable row level security;

drop policy if exists "Producers can view related transactions" on public.transactions;
create policy "Producers can view related transactions"
on public.transactions for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.producers
    where producers.id = transactions.producer_id
      and producers.user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage transactions" on public.transactions;
create policy "Admins can manage transactions"
on public.transactions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Producers can view related refunds" on public.refunds;
create policy "Producers can view related refunds"
on public.refunds for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.producers
    where producers.id = refunds.producer_id
      and producers.user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage refunds" on public.refunds;
create policy "Admins can manage refunds"
on public.refunds for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can view webhooks" on public.webhooks;
create policy "Admins can view webhooks"
on public.webhooks for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can manage webhooks" on public.webhooks;
create policy "Admins can manage webhooks"
on public.webhooks for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on table public.transactions to authenticated;
grant select on table public.refunds to authenticated;

create or replace function public.create_checkout_payment_attempt(
  p_checkout_slug text,
  p_customer_name text,
  p_customer_email text,
  p_provider public.payment_provider,
  p_environment public.payment_environment,
  p_method public.payment_method,
  p_status public.payment_status,
  p_external_payment_id text,
  p_provider_reference text,
  p_provider_checkout_url text,
  p_raw_provider_status text,
  p_provider_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_checkout record;
  v_customer_id uuid;
  v_order_id uuid;
  v_payment_id uuid;
  v_transaction_id uuid;
begin
  if char_length(trim(coalesce(p_customer_name, ''))) < 2 then
    raise exception 'Nome do cliente inválido' using errcode = '22023';
  end if;

  if position('@' in coalesce(p_customer_email, '')) <= 1 then
    raise exception 'E-mail do cliente inválido' using errcode = '22023';
  end if;

  select
    checkouts.id as checkout_id,
    checkouts.producer_id,
    products.id as product_id,
    products.name as product_name,
    products.price_cents,
    products.currency
  into v_checkout
  from public.checkouts
  join public.products on products.id = checkouts.product_id
  where checkouts.slug = p_checkout_slug
    and checkouts.status = 'published'
    and products.status = 'active'
  limit 1;

  if not found then
    raise exception 'Checkout indisponível' using errcode = '22023';
  end if;

  select customers.id
  into v_customer_id
  from public.customers
  where lower(customers.email) = lower(trim(p_customer_email))
  limit 1;

  if v_customer_id is null then
    v_customer_id := extensions.gen_random_uuid();

    insert into public.customers (id, email, name)
    values (v_customer_id, lower(trim(p_customer_email)), trim(p_customer_name));
  else
    update public.customers
    set name = trim(p_customer_name)
    where id = v_customer_id;
  end if;

  insert into public.orders (
    producer_id,
    product_id,
    checkout_id,
    customer_id,
    status,
    payment_method,
    subtotal_cents,
    discount_cents,
    total_cents,
    currency,
    external_reference,
    metadata
  )
  values (
    v_checkout.producer_id,
    v_checkout.product_id,
    v_checkout.checkout_id,
    v_customer_id,
    'pending'::public.order_status,
    p_method,
    v_checkout.price_cents,
    0,
    v_checkout.price_cents,
    v_checkout.currency,
    p_provider_reference,
    jsonb_build_object(
      'source', 'public_checkout',
      'payment_provider', p_provider,
      'payment_environment', p_environment
    )
  )
  returning id into v_order_id;

  insert into public.payments (
    order_id,
    status,
    method,
    provider,
    provider_environment,
    amount_cents,
    fee_cents,
    net_amount_cents,
    currency,
    external_payment_id,
    idempotency_key,
    raw_provider_status,
    provider_checkout_url,
    provider_reference,
    provider_payload,
    paid_at
  )
  values (
    v_order_id,
    p_status,
    p_method,
    p_provider,
    p_environment,
    v_checkout.price_cents,
    0,
    v_checkout.price_cents,
    v_checkout.currency,
    p_external_payment_id,
    p_provider_reference,
    p_raw_provider_status,
    p_provider_checkout_url,
    p_provider_reference,
    coalesce(p_provider_payload, '{}'::jsonb),
    case when p_status = 'paid'::public.payment_status then now() else null end
  )
  returning id into v_payment_id;

  insert into public.transactions (
    producer_id,
    order_id,
    payment_id,
    provider,
    provider_environment,
    transaction_type,
    status,
    amount_cents,
    currency,
    external_transaction_id,
    provider_payload,
    processed_at
  )
  values (
    v_checkout.producer_id,
    v_order_id,
    v_payment_id,
    p_provider,
    p_environment,
    'payment'::public.transaction_type,
    p_status,
    v_checkout.price_cents,
    v_checkout.currency,
    p_external_payment_id,
    coalesce(p_provider_payload, '{}'::jsonb),
    case when p_status in ('paid'::public.payment_status, 'failed'::public.payment_status) then now() else null end
  )
  returning id into v_transaction_id;

  insert into public.payment_events (
    payment_id,
    provider,
    external_event_id,
    event_type,
    status,
    payload,
    processed_at
  )
  values (
    v_payment_id,
    p_provider,
    p_provider_reference,
    'payment.checkout.created',
    'processed'::public.payment_event_status,
    jsonb_build_object(
      'provider_reference', p_provider_reference,
      'provider_environment', p_environment,
      'checkout_url', p_provider_checkout_url
    ),
    now()
  )
  on conflict do nothing;

  insert into public.outbox_events (
    event_type,
    aggregate_type,
    aggregate_id,
    payload
  )
  values (
    'payment.created',
    'payment',
    v_payment_id,
    jsonb_build_object(
      'order_id', v_order_id,
      'provider', p_provider,
      'environment', p_environment,
      'status', p_status
    )
  );

  return jsonb_build_object(
    'checkout_url', p_provider_checkout_url,
    'order_id', v_order_id,
    'payment_id', v_payment_id,
    'provider', p_provider,
    'provider_reference', p_provider_reference,
    'status', p_status,
    'transaction_id', v_transaction_id
  );
end;
$$;

create or replace function public.apply_payment_webhook_event(
  p_provider public.payment_provider,
  p_external_payment_id text,
  p_status public.payment_status,
  p_external_event_id text,
  p_event_type text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
  v_webhook_id uuid;
  v_payment_event_id uuid;
  v_order_status public.order_status;
  v_ledger_type public.ledger_entry_type;
  v_ledger_direction public.ledger_entry_direction;
begin
  insert into public.webhooks (
    provider,
    provider_environment,
    external_event_id,
    event_type,
    signature_valid,
    payload,
    status
  )
  values (
    p_provider,
    coalesce((p_payload ->> 'environment')::public.payment_environment, 'sandbox'),
    p_external_event_id,
    p_event_type,
    true,
    coalesce(p_payload, '{}'::jsonb),
    'received'::public.payment_event_status
  )
  on conflict (provider, external_event_id)
  where external_event_id is not null
  do update set
    payload = excluded.payload,
    received_at = now()
  returning id into v_webhook_id;

  select *
  into v_payment
  from public.payments
  where provider = p_provider
    and external_payment_id = p_external_payment_id
  limit 1;

  if not found then
    update public.webhooks
    set status = 'failed'::public.payment_event_status,
        error_message = 'Pagamento não encontrado'
    where id = v_webhook_id;

    return jsonb_build_object(
      'event_id', v_webhook_id,
      'payment_id', null,
      'status', p_status
    );
  end if;

  select *
  into v_order
  from public.orders
  where id = v_payment.order_id;

  insert into public.payment_events (
    payment_id,
    provider,
    external_event_id,
    event_type,
    status,
    payload,
    processed_at
  )
  values (
    v_payment.id,
    p_provider,
    p_external_event_id,
    p_event_type,
    'processed'::public.payment_event_status,
    coalesce(p_payload, '{}'::jsonb),
    now()
  )
  on conflict do nothing
  returning id into v_payment_event_id;

  update public.payments
  set status = p_status,
      raw_provider_status = p_status::text,
      provider_payload = coalesce(provider_payload, '{}'::jsonb) || coalesce(p_payload, '{}'::jsonb),
      paid_at = case
        when p_status = 'paid'::public.payment_status then coalesce(paid_at, now())
        else paid_at
      end
  where id = v_payment.id;

  v_order_status := case
    when p_status = 'paid'::public.payment_status then 'paid'::public.order_status
    when p_status = 'failed'::public.payment_status then 'failed'::public.order_status
    when p_status = 'refunded'::public.payment_status then 'refunded'::public.order_status
    when p_status = 'chargeback'::public.payment_status then 'chargeback'::public.order_status
    when p_status = 'cancelled'::public.payment_status then 'cancelled'::public.order_status
    else v_order.status
  end;

  update public.orders
  set status = v_order_status,
      payment_method = coalesce(payment_method, v_payment.method),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'last_payment_status', p_status,
        'last_payment_event', p_event_type
      )
  where id = v_order.id;

  insert into public.transactions (
    producer_id,
    order_id,
    payment_id,
    provider,
    provider_environment,
    transaction_type,
    status,
    amount_cents,
    currency,
    external_transaction_id,
    provider_payload,
    processed_at
  )
  values (
    v_order.producer_id,
    v_order.id,
    v_payment.id,
    p_provider,
    v_payment.provider_environment,
    case
      when p_status = 'refunded'::public.payment_status then 'refund'::public.transaction_type
      when p_status = 'chargeback'::public.payment_status then 'chargeback'::public.transaction_type
      when p_status = 'cancelled'::public.payment_status then 'cancellation'::public.transaction_type
      when p_status = 'authorized'::public.payment_status then 'authorization'::public.transaction_type
      else 'capture'::public.transaction_type
    end,
    p_status,
    v_payment.amount_cents,
    v_payment.currency,
    p_external_payment_id || ':' || p_external_event_id,
    coalesce(p_payload, '{}'::jsonb),
    now()
  )
  on conflict do nothing;

  if p_status = 'paid'::public.payment_status then
    v_ledger_type := 'sale'::public.ledger_entry_type;
    v_ledger_direction := 'credit'::public.ledger_entry_direction;
  elsif p_status = 'refunded'::public.payment_status then
    v_ledger_type := 'refund'::public.ledger_entry_type;
    v_ledger_direction := 'debit'::public.ledger_entry_direction;

    insert into public.refunds (
      producer_id,
      order_id,
      payment_id,
      provider,
      provider_environment,
      status,
      amount_cents,
      currency,
      reason,
      external_refund_id,
      provider_payload,
      refunded_at
    )
    values (
      v_order.producer_id,
      v_order.id,
      v_payment.id,
      p_provider,
      v_payment.provider_environment,
      p_status,
      v_payment.amount_cents,
      v_payment.currency,
      coalesce(p_payload ->> 'reason', 'Reembolso via webhook'),
      p_external_event_id,
      coalesce(p_payload, '{}'::jsonb),
      now()
    )
    on conflict do nothing;
  elsif p_status = 'chargeback'::public.payment_status then
    v_ledger_type := 'chargeback'::public.ledger_entry_type;
    v_ledger_direction := 'debit'::public.ledger_entry_direction;
  else
    v_ledger_type := null;
    v_ledger_direction := null;
  end if;

  if v_ledger_type is not null
    and not exists (
      select 1
      from public.ledger_entries
      where payment_id = v_payment.id
        and entry_type = v_ledger_type
    )
  then
    insert into public.ledger_entries (
      producer_id,
      order_id,
      payment_id,
      entry_type,
      direction,
      amount_cents,
      currency,
      description,
      available_at,
      metadata
    )
    values (
      v_order.producer_id,
      v_order.id,
      v_payment.id,
      v_ledger_type,
      v_ledger_direction,
      v_payment.amount_cents,
      v_payment.currency,
      case
        when v_ledger_type = 'sale'::public.ledger_entry_type then 'Venda aprovada via gateway'
        when v_ledger_type = 'refund'::public.ledger_entry_type then 'Reembolso processado via gateway'
        else 'Chargeback processado via gateway'
      end,
      now(),
      jsonb_build_object(
        'payment_event_id', coalesce(v_payment_event_id, v_webhook_id),
        'provider', p_provider,
        'status', p_status
      )
    );
  end if;

  update public.webhooks
  set status = 'processed'::public.payment_event_status,
      processed_at = now()
  where id = v_webhook_id;

  insert into public.outbox_events (
    event_type,
    aggregate_type,
    aggregate_id,
    payload
  )
  values (
    'payment.status_changed',
    'payment',
    v_payment.id,
    jsonb_build_object(
      'order_id', v_order.id,
      'provider', p_provider,
      'status', p_status,
      'event_type', p_event_type
    )
  );

  return jsonb_build_object(
    'event_id', coalesce(v_payment_event_id, v_webhook_id),
    'payment_id', v_payment.id,
    'status', p_status
  );
end;
$$;

grant execute on function public.create_checkout_payment_attempt(
  text,
  text,
  text,
  public.payment_provider,
  public.payment_environment,
  public.payment_method,
  public.payment_status,
  text,
  text,
  text,
  text,
  jsonb
) to anon, authenticated;

grant execute on function public.apply_payment_webhook_event(
  public.payment_provider,
  text,
  public.payment_status,
  text,
  text,
  jsonb
) to anon, authenticated;

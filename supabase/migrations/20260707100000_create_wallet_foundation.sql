do $$
begin
  create type public.wallet_transaction_type as enum (
    'sale',
    'refund',
    'chargeback',
    'withdrawal',
    'withdrawal_cancelled',
    'platform_fee',
    'adjustment'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.wallet_transaction_status as enum (
    'pending',
    'available',
    'processing',
    'paid',
    'failed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.withdrawal_status as enum (
    'requested',
    'processing',
    'paid',
    'failed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end;
$$;

alter type public.withdrawal_status add value if not exists 'failed';
alter type public.withdrawal_status add value if not exists 'cancelled';

do $$
begin
  create type public.pix_key_type as enum (
    'cpf',
    'cnpj',
    'email',
    'phone',
    'random'
  );
exception
  when duplicate_object then null;
end;
$$;

alter type public.notification_event_type add value if not exists 'balance_available';
alter type public.notification_event_type add value if not exists 'withdrawal_requested';
alter type public.notification_event_type add value if not exists 'withdrawal_paid';
alter type public.notification_event_type add value if not exists 'withdrawal_failed';

create table if not exists public.wallets (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete cascade,
  available_balance_cents integer not null default 0,
  pending_balance_cents integer not null default 0,
  total_received_cents integer not null default 0,
  total_withdrawn_cents integer not null default 0,
  total_fees_paid_cents integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallets_producer_id_key unique (producer_id),
  constraint wallets_non_negative_balances_check check (
    available_balance_cents >= 0
    and pending_balance_cents >= 0
    and total_received_cents >= 0
    and total_withdrawn_cents >= 0
    and total_fees_paid_cents >= 0
  )
);

create table if not exists public.withdrawal_settings (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete cascade,
  default_pix_key_type public.pix_key_type,
  default_pix_key text,
  default_holder_name text,
  default_holder_document text,
  default_bank_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint withdrawal_settings_producer_id_key unique (producer_id),
  constraint withdrawal_settings_pix_key_length_check check (
    default_pix_key is null or char_length(default_pix_key) between 3 and 160
  ),
  constraint withdrawal_settings_holder_name_length_check check (
    default_holder_name is null or char_length(default_holder_name) between 3 and 160
  ),
  constraint withdrawal_settings_holder_document_length_check check (
    default_holder_document is null or char_length(default_holder_document) between 11 and 32
  )
);

create table if not exists public.withdrawal_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete restrict,
  producer_id uuid not null references public.producers(id) on delete cascade,
  amount_cents integer not null,
  status public.withdrawal_status not null default 'requested',
  pix_key_type public.pix_key_type not null,
  pix_key text not null,
  holder_name text not null,
  holder_document text not null,
  bank_name text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  failed_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint withdrawal_requests_amount_check check (amount_cents > 0),
  constraint withdrawal_requests_pix_key_length_check check (char_length(pix_key) between 3 and 160),
  constraint withdrawal_requests_holder_name_length_check check (char_length(holder_name) between 3 and 160),
  constraint withdrawal_requests_holder_document_length_check check (char_length(holder_document) between 11 and 32)
);

create table if not exists public.wallet_transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete restrict,
  producer_id uuid not null references public.producers(id) on delete cascade,
  order_id uuid references public.orders(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete restrict,
  withdrawal_request_id uuid references public.withdrawal_requests(id) on delete restrict,
  type public.wallet_transaction_type not null,
  status public.wallet_transaction_status not null,
  gross_amount_cents integer not null default 0,
  platform_fee_amount_cents integer not null default 0,
  gateway_fee_amount_cents integer not null default 0,
  net_amount_cents integer not null default 0,
  available_at timestamptz,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallet_transactions_gross_amount_check check (gross_amount_cents >= 0),
  constraint wallet_transactions_platform_fee_check check (platform_fee_amount_cents >= 0),
  constraint wallet_transactions_gateway_fee_check check (gateway_fee_amount_cents >= 0)
);

create table if not exists public.platform_revenue (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete cascade,
  order_id uuid references public.orders(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete restrict,
  gross_amount_cents integer not null default 0,
  platform_fee_amount_cents integer not null default 0,
  gateway_fee_amount_cents integer not null default 0,
  net_amount_to_producer_cents integer not null default 0,
  status public.payment_status not null default 'paid',
  created_at timestamptz not null default now(),
  constraint platform_revenue_payment_id_key unique (payment_id),
  constraint platform_revenue_amounts_check check (
    gross_amount_cents >= 0
    and platform_fee_amount_cents >= 0
    and gateway_fee_amount_cents >= 0
    and net_amount_to_producer_cents >= 0
  )
);

drop trigger if exists wallets_set_updated_at on public.wallets;
create trigger wallets_set_updated_at
before update on public.wallets
for each row execute function public.set_updated_at();

drop trigger if exists withdrawal_settings_set_updated_at on public.withdrawal_settings;
create trigger withdrawal_settings_set_updated_at
before update on public.withdrawal_settings
for each row execute function public.set_updated_at();

drop trigger if exists withdrawal_requests_set_updated_at on public.withdrawal_requests;
create trigger withdrawal_requests_set_updated_at
before update on public.withdrawal_requests
for each row execute function public.set_updated_at();

drop trigger if exists wallet_transactions_set_updated_at on public.wallet_transactions;
create trigger wallet_transactions_set_updated_at
before update on public.wallet_transactions
for each row execute function public.set_updated_at();

create index if not exists wallets_producer_id_idx
on public.wallets (producer_id);

create index if not exists wallet_transactions_producer_created_at_idx
on public.wallet_transactions (producer_id, created_at desc);

create index if not exists wallet_transactions_wallet_created_at_idx
on public.wallet_transactions (wallet_id, created_at desc);

create unique index if not exists wallet_transactions_payment_type_idx
on public.wallet_transactions (payment_id, type)
where payment_id is not null;

create index if not exists wallet_transactions_available_idx
on public.wallet_transactions (status, available_at)
where status = 'pending';

create index if not exists withdrawal_requests_producer_status_idx
on public.withdrawal_requests (producer_id, status, requested_at desc);

create index if not exists withdrawal_settings_producer_id_idx
on public.withdrawal_settings (producer_id);

create index if not exists platform_revenue_created_at_idx
on public.platform_revenue (created_at desc);

create index if not exists platform_revenue_producer_created_at_idx
on public.platform_revenue (producer_id, created_at desc);

alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.withdrawal_settings enable row level security;
alter table public.platform_revenue enable row level security;

drop policy if exists "Producers can view own wallet" on public.wallets;
create policy "Producers can view own wallet"
on public.wallets for select
using (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = wallets.producer_id
      and producers.user_id = auth.uid()
  )
);

drop policy if exists "Producers can view own wallet transactions" on public.wallet_transactions;
create policy "Producers can view own wallet transactions"
on public.wallet_transactions for select
using (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = wallet_transactions.producer_id
      and producers.user_id = auth.uid()
  )
);

drop policy if exists "Producers can view own withdrawal requests" on public.withdrawal_requests;
create policy "Producers can view own withdrawal requests"
on public.withdrawal_requests for select
using (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = withdrawal_requests.producer_id
      and producers.user_id = auth.uid()
  )
);

drop policy if exists "Producers can view own withdrawal settings" on public.withdrawal_settings;
create policy "Producers can view own withdrawal settings"
on public.withdrawal_settings for select
using (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = withdrawal_settings.producer_id
      and producers.user_id = auth.uid()
  )
);

drop policy if exists "Producers can manage own withdrawal settings" on public.withdrawal_settings;
create policy "Producers can manage own withdrawal settings"
on public.withdrawal_settings for all
using (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = withdrawal_settings.producer_id
      and producers.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = withdrawal_settings.producer_id
      and producers.user_id = auth.uid()
  )
);

drop policy if exists "Producers can view own platform revenue" on public.platform_revenue;
create policy "Producers can view own platform revenue"
on public.platform_revenue for select
using (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = platform_revenue.producer_id
      and producers.user_id = auth.uid()
  )
);

grant select on table public.wallets to authenticated;
grant select on table public.wallet_transactions to authenticated;
grant select on table public.withdrawal_requests to authenticated;
grant select, insert, update on table public.withdrawal_settings to authenticated;
grant select on table public.platform_revenue to authenticated;

create or replace function public.ensure_wallet_for_producer(
  p_producer_id uuid
)
returns public.wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.wallets;
begin
  if coalesce(auth.role(), '') <> 'service_role'
    and not public.is_admin()
    and not exists (
      select 1 from public.producers
      where producers.id = p_producer_id
        and producers.user_id = auth.uid()
    )
  then
    raise exception 'Acesso não autorizado.';
  end if;

  insert into public.wallets (producer_id)
  values (p_producer_id)
  on conflict (producer_id) do update
    set updated_at = public.wallets.updated_at
  returning * into v_wallet;

  return v_wallet;
end;
$$;

create or replace function public.release_due_wallet_transactions(
  p_producer_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_released_count integer := 0;
  v_released_amount integer := 0;
  v_wallet public.wallets;
begin
  if coalesce(auth.role(), '') <> 'service_role'
    and not public.is_admin()
    and not exists (
      select 1 from public.producers
      where producers.id = p_producer_id
        and producers.user_id = auth.uid()
    )
  then
    raise exception 'Acesso não autorizado.';
  end if;

  select *
  into v_wallet
  from public.ensure_wallet_for_producer(p_producer_id);

  with released as (
    update public.wallet_transactions
    set status = 'available'::public.wallet_transaction_status
    where producer_id = p_producer_id
      and type = 'sale'::public.wallet_transaction_type
      and status = 'pending'::public.wallet_transaction_status
      and available_at <= now()
    returning net_amount_cents
  )
  select count(*), coalesce(sum(net_amount_cents), 0)
  into v_released_count, v_released_amount
  from released;

  if v_released_amount > 0 then
    update public.wallets
    set pending_balance_cents = greatest(pending_balance_cents - v_released_amount, 0),
        available_balance_cents = available_balance_cents + v_released_amount
    where id = v_wallet.id;
  end if;

  return v_released_count;
end;
$$;

create or replace function public.process_wallet_payment_event(
  p_payment_id uuid,
  p_status public.payment_status,
  p_platform_fee_fixed_amount_cents integer default 0,
  p_platform_fee_percentage numeric default 0,
  p_gateway_fee_amount_cents integer default 0,
  p_settlement_days integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
  v_producer public.producers%rowtype;
  v_wallet public.wallets;
  v_gross integer;
  v_platform_fee integer;
  v_gateway_fee integer;
  v_total_fee integer;
  v_net integer;
  v_available_at timestamptz;
  v_transaction_status public.wallet_transaction_status;
  v_transaction_type public.wallet_transaction_type;
  v_existing_sale public.wallet_transactions%rowtype;
  v_inserted_id uuid;
  v_created boolean := false;
begin
  select *
  into v_payment
  from public.payments
  where id = p_payment_id;

  if not found then
    return jsonb_build_object('processed', false, 'reason', 'payment_not_found');
  end if;

  select *
  into v_order
  from public.orders
  where id = v_payment.order_id;

  if not found then
    return jsonb_build_object('processed', false, 'reason', 'order_not_found');
  end if;

  select *
  into v_producer
  from public.producers
  where id = v_order.producer_id;

  if not found then
    return jsonb_build_object('processed', false, 'reason', 'producer_not_found');
  end if;

  select *
  into v_wallet
  from public.ensure_wallet_for_producer(v_order.producer_id);

  v_gross := greatest(v_payment.amount_cents, 0);
  v_platform_fee := greatest(
    coalesce(p_platform_fee_fixed_amount_cents, 0)
    + round(v_gross * greatest(coalesce(p_platform_fee_percentage, 0), 0) / 100)::integer,
    0
  );
  v_gateway_fee := greatest(coalesce(p_gateway_fee_amount_cents, 0), 0);
  v_total_fee := least(v_gross, v_platform_fee + v_gateway_fee);
  v_platform_fee := least(v_platform_fee, v_total_fee);
  v_gateway_fee := v_total_fee - v_platform_fee;
  v_net := greatest(v_gross - v_total_fee, 0);
  v_available_at := now() + make_interval(days => greatest(coalesce(p_settlement_days, 0), 0));
  v_transaction_status := case
    when greatest(coalesce(p_settlement_days, 0), 0) = 0 then 'available'::public.wallet_transaction_status
    else 'pending'::public.wallet_transaction_status
  end;

  if p_status = 'paid'::public.payment_status then
    insert into public.wallet_transactions (
      wallet_id,
      producer_id,
      order_id,
      payment_id,
      type,
      status,
      gross_amount_cents,
      platform_fee_amount_cents,
      gateway_fee_amount_cents,
      net_amount_cents,
      available_at,
      description,
      metadata
    )
    values (
      v_wallet.id,
      v_order.producer_id,
      v_order.id,
      v_payment.id,
      'sale'::public.wallet_transaction_type,
      v_transaction_status,
      v_gross,
      v_platform_fee,
      v_gateway_fee,
      v_net,
      v_available_at,
      'Venda aprovada',
      jsonb_build_object(
        'payment_status', p_status,
        'settlement_days', greatest(coalesce(p_settlement_days, 0), 0)
      )
    )
    on conflict (payment_id, type) where payment_id is not null do nothing
    returning id into v_inserted_id;

    v_created := v_inserted_id is not null;

    if v_created then
      insert into public.platform_revenue (
        producer_id,
        order_id,
        payment_id,
        gross_amount_cents,
        platform_fee_amount_cents,
        gateway_fee_amount_cents,
        net_amount_to_producer_cents,
        status
      )
      values (
        v_order.producer_id,
        v_order.id,
        v_payment.id,
        v_gross,
        v_platform_fee,
        v_gateway_fee,
        v_net,
        p_status
      )
      on conflict (payment_id) do update
        set status = excluded.status;

      update public.payments
      set fee_cents = v_total_fee,
          net_amount_cents = v_net
      where id = v_payment.id;

      update public.wallets
      set available_balance_cents = available_balance_cents + case when v_transaction_status = 'available' then v_net else 0 end,
          pending_balance_cents = pending_balance_cents + case when v_transaction_status = 'pending' then v_net else 0 end,
          total_received_cents = total_received_cents + v_net,
          total_fees_paid_cents = total_fees_paid_cents + v_total_fee
      where id = v_wallet.id;
    end if;
  elsif p_status in ('refunded'::public.payment_status, 'chargeback'::public.payment_status) then
    v_transaction_type := case
      when p_status = 'refunded'::public.payment_status then 'refund'::public.wallet_transaction_type
      else 'chargeback'::public.wallet_transaction_type
    end;

    select *
    into v_existing_sale
    from public.wallet_transactions
    where payment_id = v_payment.id
      and type = 'sale'::public.wallet_transaction_type
    limit 1;

    if found then
      v_net := greatest(v_existing_sale.net_amount_cents, 0);
      v_platform_fee := greatest(v_existing_sale.platform_fee_amount_cents, 0);
      v_gateway_fee := greatest(v_existing_sale.gateway_fee_amount_cents, 0);
    end if;

    insert into public.wallet_transactions (
      wallet_id,
      producer_id,
      order_id,
      payment_id,
      type,
      status,
      gross_amount_cents,
      platform_fee_amount_cents,
      gateway_fee_amount_cents,
      net_amount_cents,
      available_at,
      description,
      metadata
    )
    values (
      v_wallet.id,
      v_order.producer_id,
      v_order.id,
      v_payment.id,
      v_transaction_type,
      'available'::public.wallet_transaction_status,
      v_gross,
      v_platform_fee,
      v_gateway_fee,
      -v_net,
      now(),
      case
        when v_transaction_type = 'refund'::public.wallet_transaction_type then 'Reembolso registrado'
        else 'Chargeback registrado'
      end,
      jsonb_build_object('payment_status', p_status)
    )
    on conflict (payment_id, type) where payment_id is not null do nothing
    returning id into v_inserted_id;

    v_created := v_inserted_id is not null;

    if v_created then
      update public.platform_revenue
      set status = p_status
      where payment_id = v_payment.id;

      if v_existing_sale.status = 'pending'::public.wallet_transaction_status then
        update public.wallets
        set pending_balance_cents = greatest(pending_balance_cents - v_net, 0)
        where id = v_wallet.id;
      else
        update public.wallets
        set available_balance_cents = greatest(available_balance_cents - v_net, 0)
        where id = v_wallet.id;
      end if;
    end if;
  else
    return jsonb_build_object(
      'processed', false,
      'reason', 'status_not_financial',
      'payment_id', v_payment.id,
      'status', p_status
    );
  end if;

  return jsonb_build_object(
    'processed', v_created,
    'payment_id', v_payment.id,
    'producer_id', v_order.producer_id,
    'user_id', v_producer.user_id,
    'status', p_status,
    'gross_amount_cents', v_gross,
    'platform_fee_amount_cents', v_platform_fee,
    'gateway_fee_amount_cents', v_gateway_fee,
    'net_amount_cents', v_net,
    'available_at', v_available_at,
    'is_available_now', v_transaction_status = 'available'::public.wallet_transaction_status
  );
end;
$$;

create or replace function public.request_wallet_withdrawal(
  p_producer_id uuid,
  p_amount_cents integer,
  p_pix_key_type public.pix_key_type,
  p_pix_key text,
  p_holder_name text,
  p_holder_document text,
  p_bank_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.wallets;
  v_request_id uuid;
  v_transaction_id uuid;
  v_user_id uuid;
begin
  if p_amount_cents <= 0 then
    raise exception 'Valor de saque inválido.';
  end if;

  select producers.user_id
  into v_user_id
  from public.producers
  where producers.id = p_producer_id;

  if not found then
    raise exception 'Área comercial não encontrada.';
  end if;

  if not public.is_admin() and v_user_id <> auth.uid() then
    raise exception 'Acesso não autorizado.';
  end if;

  perform public.ensure_wallet_for_producer(p_producer_id);

  select *
  into v_wallet
  from public.wallets
  where producer_id = p_producer_id
  for update;

  if v_wallet.available_balance_cents < p_amount_cents then
    raise exception 'Saldo disponível insuficiente.';
  end if;

  update public.wallets
  set available_balance_cents = available_balance_cents - p_amount_cents,
      total_withdrawn_cents = total_withdrawn_cents + p_amount_cents
  where id = v_wallet.id;

  insert into public.withdrawal_requests (
    wallet_id,
    producer_id,
    amount_cents,
    status,
    pix_key_type,
    pix_key,
    holder_name,
    holder_document,
    bank_name
  )
  values (
    v_wallet.id,
    p_producer_id,
    p_amount_cents,
    'requested'::public.withdrawal_status,
    p_pix_key_type,
    trim(p_pix_key),
    trim(p_holder_name),
    regexp_replace(p_holder_document, '\D', '', 'g'),
    nullif(trim(coalesce(p_bank_name, '')), '')
  )
  returning id into v_request_id;

  insert into public.wallet_transactions (
    wallet_id,
    producer_id,
    withdrawal_request_id,
    type,
    status,
    gross_amount_cents,
    net_amount_cents,
    available_at,
    description,
    metadata
  )
  values (
    v_wallet.id,
    p_producer_id,
    v_request_id,
    'withdrawal'::public.wallet_transaction_type,
    'processing'::public.wallet_transaction_status,
    p_amount_cents,
    -p_amount_cents,
    now(),
    'Saque solicitado',
    jsonb_build_object('withdrawal_request_id', v_request_id)
  )
  returning id into v_transaction_id;

  return jsonb_build_object(
    'withdrawal_request_id', v_request_id,
    'wallet_transaction_id', v_transaction_id,
    'producer_id', p_producer_id,
    'user_id', v_user_id,
    'amount_cents', p_amount_cents,
    'status', 'requested'
  );
end;
$$;

grant execute on function public.ensure_wallet_for_producer(uuid) to authenticated, service_role;
grant execute on function public.release_due_wallet_transactions(uuid) to authenticated, service_role;
grant execute on function public.process_wallet_payment_event(
  uuid,
  public.payment_status,
  integer,
  numeric,
  integer,
  integer
) to service_role;
grant execute on function public.request_wallet_withdrawal(
  uuid,
  integer,
  public.pix_key_type,
  text,
  text,
  text,
  text
) to authenticated;

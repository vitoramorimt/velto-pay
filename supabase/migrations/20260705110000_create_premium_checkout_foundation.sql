do $$
begin
  create type public.checkout_offer_type as enum (
    'order_bump',
    'upsell',
    'downsell'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.checkout_offer_status as enum (
    'active',
    'inactive'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.coupon_discount_type as enum (
    'percentage',
    'fixed'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.coupon_status as enum (
    'active',
    'inactive'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.coupon_redemption_status as enum (
    'reserved',
    'redeemed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.checkout_pixel_provider as enum (
    'meta',
    'google_analytics',
    'google_tag_manager',
    'tiktok'
  );
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.checkout_offers (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete cascade,
  checkout_id uuid not null references public.checkouts(id) on delete cascade,
  offer_type public.checkout_offer_type not null,
  status public.checkout_offer_status not null default 'active',
  title text not null,
  description text,
  amount_cents integer not null,
  currency char(3) not null default 'BRL',
  badge_text text,
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint checkout_offers_title_length_check check (char_length(title) between 3 and 140),
  constraint checkout_offers_amount_cents_check check (amount_cents >= 0),
  constraint checkout_offers_currency_check check (currency = upper(currency))
);

create table if not exists public.coupons (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete cascade,
  checkout_id uuid references public.checkouts(id) on delete cascade,
  code text not null,
  status public.coupon_status not null default 'active',
  discount_type public.coupon_discount_type not null,
  discount_value integer not null,
  max_redemptions integer,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_code_format_check check (code ~ '^[A-Za-z0-9_-]{3,32}$'),
  constraint coupons_discount_value_check check (discount_value > 0),
  constraint coupons_percentage_value_check check (
    discount_type <> 'percentage'::public.coupon_discount_type
    or discount_value between 1 and 10000
  ),
  constraint coupons_max_redemptions_check check (
    max_redemptions is null or max_redemptions > 0
  )
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default extensions.gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_email text not null,
  discount_cents integer not null,
  status public.coupon_redemption_status not null default 'reserved',
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupon_redemptions_discount_check check (discount_cents >= 0),
  constraint coupon_redemptions_email_check check (position('@' in customer_email) > 1)
);

create table if not exists public.checkout_pixels (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete cascade,
  checkout_id uuid not null references public.checkouts(id) on delete cascade,
  provider public.checkout_pixel_provider not null,
  pixel_id text not null,
  status public.checkout_offer_status not null default 'active',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint checkout_pixels_pixel_id_length_check check (char_length(pixel_id) between 3 and 120)
);

create table if not exists public.checkout_tracking_events (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete cascade,
  checkout_id uuid not null references public.checkouts(id) on delete cascade,
  event_type text not null default 'view',
  session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint checkout_tracking_events_event_type_check check (char_length(event_type) between 2 and 64)
);

create trigger checkout_offers_set_updated_at
before update on public.checkout_offers
for each row execute function public.set_updated_at();

create trigger coupons_set_updated_at
before update on public.coupons
for each row execute function public.set_updated_at();

create trigger coupon_redemptions_set_updated_at
before update on public.coupon_redemptions
for each row execute function public.set_updated_at();

create trigger checkout_pixels_set_updated_at
before update on public.checkout_pixels
for each row execute function public.set_updated_at();

create index if not exists checkout_offers_checkout_type_status_idx
on public.checkout_offers (checkout_id, offer_type, status, position);

create index if not exists checkout_offers_producer_idx
on public.checkout_offers (producer_id, created_at desc);

create unique index if not exists coupons_producer_code_idx
on public.coupons (producer_id, lower(code));

create index if not exists coupons_checkout_status_idx
on public.coupons (checkout_id, status);

create index if not exists coupon_redemptions_coupon_status_idx
on public.coupon_redemptions (coupon_id, status);

create unique index if not exists coupon_redemptions_coupon_order_idx
on public.coupon_redemptions (coupon_id, order_id);

create index if not exists checkout_pixels_checkout_status_idx
on public.checkout_pixels (checkout_id, status);

create index if not exists checkout_tracking_events_checkout_created_at_idx
on public.checkout_tracking_events (checkout_id, created_at desc);

alter table public.checkout_offers enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.checkout_pixels enable row level security;
alter table public.checkout_tracking_events enable row level security;

drop policy if exists "Public can view active checkout offers" on public.checkout_offers;
create policy "Public can view active checkout offers"
on public.checkout_offers for select
to anon, authenticated
using (
  status = 'active'::public.checkout_offer_status
  and exists (
    select 1
    from public.checkouts
    join public.products on products.id = checkouts.product_id
    where checkouts.id = checkout_offers.checkout_id
      and checkouts.status = 'published'::public.checkout_status
      and products.status = 'active'::public.product_status
  )
);

drop policy if exists "Producers can manage own checkout offers" on public.checkout_offers;
create policy "Producers can manage own checkout offers"
on public.checkout_offers for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = checkout_offers.producer_id
      and producers.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = checkout_offers.producer_id
      and producers.user_id = auth.uid()
  )
);

drop policy if exists "Public can view active coupons" on public.coupons;
create policy "Public can view active coupons"
on public.coupons for select
to anon, authenticated
using (
  status = 'active'::public.coupon_status
  and (expires_at is null or expires_at > now())
  and (
    checkout_id is null
    or exists (
      select 1
      from public.checkouts
      join public.products on products.id = checkouts.product_id
      where checkouts.id = coupons.checkout_id
        and checkouts.status = 'published'::public.checkout_status
        and products.status = 'active'::public.product_status
    )
  )
);

drop policy if exists "Producers can manage own coupons" on public.coupons;
create policy "Producers can manage own coupons"
on public.coupons for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = coupons.producer_id
      and producers.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = coupons.producer_id
      and producers.user_id = auth.uid()
  )
);

drop policy if exists "Producers can view own coupon redemptions" on public.coupon_redemptions;
create policy "Producers can view own coupon redemptions"
on public.coupon_redemptions for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.coupons
    join public.producers on producers.id = coupons.producer_id
    where coupons.id = coupon_redemptions.coupon_id
      and producers.user_id = auth.uid()
  )
);

drop policy if exists "Public can view active checkout pixels" on public.checkout_pixels;
create policy "Public can view active checkout pixels"
on public.checkout_pixels for select
to anon, authenticated
using (
  status = 'active'::public.checkout_offer_status
  and exists (
    select 1
    from public.checkouts
    join public.products on products.id = checkouts.product_id
    where checkouts.id = checkout_pixels.checkout_id
      and checkouts.status = 'published'::public.checkout_status
      and products.status = 'active'::public.product_status
  )
);

drop policy if exists "Producers can manage own checkout pixels" on public.checkout_pixels;
create policy "Producers can manage own checkout pixels"
on public.checkout_pixels for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = checkout_pixels.producer_id
      and producers.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = checkout_pixels.producer_id
      and producers.user_id = auth.uid()
  )
);

drop policy if exists "Public can append checkout tracking events" on public.checkout_tracking_events;
create policy "Public can append checkout tracking events"
on public.checkout_tracking_events for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.checkouts
    join public.products on products.id = checkouts.product_id
    where checkouts.id = checkout_tracking_events.checkout_id
      and checkouts.status = 'published'::public.checkout_status
      and products.status = 'active'::public.product_status
  )
);

drop policy if exists "Producers can view own checkout tracking events" on public.checkout_tracking_events;
create policy "Producers can view own checkout tracking events"
on public.checkout_tracking_events for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = checkout_tracking_events.producer_id
      and producers.user_id = auth.uid()
  )
);

grant select on table public.checkout_offers to anon, authenticated;
grant select on table public.coupons to anon, authenticated;
grant select on table public.checkout_pixels to anon, authenticated;
grant insert on table public.checkout_tracking_events to anon, authenticated;
grant select on table public.checkout_tracking_events to authenticated;

create or replace function public.create_premium_checkout_payment_attempt(
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
  p_provider_payload jsonb,
  p_coupon_code text default null,
  p_order_bump_ids uuid[] default '{}'::uuid[],
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_utm_term text default null,
  p_utm_content text default null
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
  v_coupon record;
  v_coupon_id uuid;
  v_bump_total_cents integer := 0;
  v_discount_cents integer := 0;
  v_valid_bump_count integer := 0;
  v_requested_bump_count integer := 0;
  v_subtotal_cents integer := 0;
  v_total_cents integer := 0;
  v_selected_bumps jsonb := '[]'::jsonb;
  v_coupon_payload jsonb := null;
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

  select coalesce(cardinality(p_order_bump_ids), 0)
  into v_requested_bump_count;

  if v_requested_bump_count > 0 then
    select
      count(*),
      coalesce(sum(amount_cents), 0),
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', id,
            'title', title,
            'amount_cents', amount_cents,
            'currency', currency
          )
          order by position, created_at
        ),
        '[]'::jsonb
      )
    into v_valid_bump_count, v_bump_total_cents, v_selected_bumps
    from public.checkout_offers
    where id = any(p_order_bump_ids)
      and checkout_id = v_checkout.checkout_id
      and offer_type = 'order_bump'::public.checkout_offer_type
      and status = 'active'::public.checkout_offer_status;

    if v_valid_bump_count <> v_requested_bump_count then
      raise exception 'Oferta adicional inválida' using errcode = '22023';
    end if;
  end if;

  v_subtotal_cents := v_checkout.price_cents + v_bump_total_cents;

  if nullif(trim(coalesce(p_coupon_code, '')), '') is not null then
    select *
    into v_coupon
    from public.coupons
    where producer_id = v_checkout.producer_id
      and lower(code) = lower(trim(p_coupon_code))
      and status = 'active'::public.coupon_status
      and (checkout_id is null or checkout_id = v_checkout.checkout_id)
      and (expires_at is null or expires_at > now())
    order by checkout_id nulls last
    limit 1;

    if not found then
      raise exception 'Cupom inválido ou expirado' using errcode = '22023';
    end if;

    if v_coupon.max_redemptions is not null
      and (
        select count(*)
        from public.coupon_redemptions
        where coupon_id = v_coupon.id
          and status in (
            'reserved'::public.coupon_redemption_status,
            'redeemed'::public.coupon_redemption_status
          )
      ) >= v_coupon.max_redemptions
    then
      raise exception 'Cupom sem usos disponíveis' using errcode = '22023';
    end if;

    v_coupon_id := v_coupon.id;

    if v_coupon.discount_type = 'percentage'::public.coupon_discount_type then
      v_discount_cents := floor((v_subtotal_cents * v_coupon.discount_value)::numeric / 10000)::integer;
    else
      v_discount_cents := v_coupon.discount_value;
    end if;

    v_discount_cents := least(v_discount_cents, greatest(v_subtotal_cents - 100, 0));
    v_coupon_payload := jsonb_build_object(
      'id', v_coupon.id,
      'code', v_coupon.code,
      'discount_type', v_coupon.discount_type,
      'discount_value', v_coupon.discount_value,
      'discount_cents', v_discount_cents
    );
  end if;

  v_total_cents := greatest(v_subtotal_cents - v_discount_cents, 100);

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
    v_subtotal_cents,
    v_discount_cents,
    v_total_cents,
    v_checkout.currency,
    p_provider_reference,
    jsonb_build_object(
      'source', 'public_checkout',
      'payment_provider', p_provider,
      'payment_environment', p_environment,
      'premium_checkout', jsonb_build_object(
        'order_bumps', v_selected_bumps,
        'coupon', v_coupon_payload
      ),
      'utm', jsonb_build_object(
        'source', p_utm_source,
        'medium', p_utm_medium,
        'campaign', p_utm_campaign,
        'term', p_utm_term,
        'content', p_utm_content
      )
    )
  )
  returning id into v_order_id;

  if v_coupon_id is not null then
    insert into public.coupon_redemptions (
      coupon_id,
      order_id,
      customer_email,
      discount_cents,
      status
    )
    values (
      v_coupon_id,
      v_order_id,
      lower(trim(p_customer_email)),
      v_discount_cents,
      'reserved'::public.coupon_redemption_status
    );
  end if;

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
    v_total_cents,
    0,
    v_total_cents,
    v_checkout.currency,
    p_external_payment_id,
    p_provider_reference,
    p_raw_provider_status,
    p_provider_checkout_url,
    p_provider_reference,
    coalesce(p_provider_payload, '{}'::jsonb) || jsonb_build_object(
      'premium_checkout', jsonb_build_object(
        'subtotal_cents', v_subtotal_cents,
        'discount_cents', v_discount_cents,
        'total_cents', v_total_cents,
        'order_bumps', v_selected_bumps,
        'coupon', v_coupon_payload
      )
    ),
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
    v_total_cents,
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
      'checkout_url', p_provider_checkout_url,
      'amount_cents', v_total_cents
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
      'status', p_status,
      'amount_cents', v_total_cents
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

create or replace function public.get_checkout_success_context(
  p_provider_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_context jsonb;
begin
  select jsonb_build_object(
    'order_id', orders.id,
    'checkout_id', checkouts.id,
    'product_name', products.name,
    'total_cents', orders.total_cents,
    'currency', orders.currency,
    'offers', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', checkout_offers.id,
            'type', checkout_offers.offer_type,
            'title', checkout_offers.title,
            'description', checkout_offers.description,
            'amount_cents', checkout_offers.amount_cents,
            'currency', checkout_offers.currency,
            'badge_text', checkout_offers.badge_text
          )
          order by checkout_offers.offer_type, checkout_offers.position, checkout_offers.created_at
        )
        from public.checkout_offers
        where checkout_offers.checkout_id = checkouts.id
          and checkout_offers.offer_type in ('upsell'::public.checkout_offer_type, 'downsell'::public.checkout_offer_type)
          and checkout_offers.status = 'active'::public.checkout_offer_status
      ),
      '[]'::jsonb
    )
  )
  into v_context
  from public.payments
  join public.orders on orders.id = payments.order_id
  join public.checkouts on checkouts.id = orders.checkout_id
  join public.products on products.id = orders.product_id
  where payments.provider_reference = p_provider_reference
  limit 1;

  return v_context;
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

  if p_status = 'paid'::public.payment_status then
    update public.coupon_redemptions
    set status = 'redeemed'::public.coupon_redemption_status,
        redeemed_at = coalesce(redeemed_at, now())
    where order_id = v_order.id
      and status = 'reserved'::public.coupon_redemption_status;
  elsif p_status in ('failed'::public.payment_status, 'cancelled'::public.payment_status) then
    update public.coupon_redemptions
    set status = 'cancelled'::public.coupon_redemption_status
    where order_id = v_order.id
      and status = 'reserved'::public.coupon_redemption_status;
  end if;

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

grant execute on function public.create_premium_checkout_payment_attempt(
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
  jsonb,
  text,
  uuid[],
  text,
  text,
  text,
  text,
  text
) to anon, authenticated;

grant execute on function public.get_checkout_success_context(text)
to anon, authenticated;

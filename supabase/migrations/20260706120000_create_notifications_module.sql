do $$
begin
  create type public.notification_event_type as enum (
    'sale_approved',
    'pix_created',
    'pix_expired',
    'payment_pending',
    'payment_failed',
    'payment_paid',
    'refund_created',
    'chargeback_created',
    'order_created',
    'customer_created'
  );
exception
  when duplicate_object then null;
end;
$$;

create table public.notification_subscriptions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  producer_id uuid not null references public.producers(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  platform text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz,
  constraint notification_subscriptions_endpoint_length_check check (char_length(endpoint) <= 2048)
);

create table public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  producer_id uuid not null references public.producers(id) on delete cascade,
  event_type public.notification_event_type not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_title_length_check check (char_length(title) between 1 and 140),
  constraint notifications_body_length_check check (char_length(body) between 1 and 260)
);

create table public.notification_preferences (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  producer_id uuid not null references public.producers(id) on delete cascade,
  sales_enabled boolean not null default true,
  pix_enabled boolean not null default true,
  refunds_enabled boolean not null default true,
  chargebacks_enabled boolean not null default true,
  failed_payments_enabled boolean not null default true,
  financial_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, producer_id)
);

create trigger notification_subscriptions_set_updated_at
before update on public.notification_subscriptions
for each row execute function public.set_updated_at();

create trigger notification_preferences_set_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();

create index notification_subscriptions_user_id_idx
on public.notification_subscriptions (user_id);

create index notification_subscriptions_producer_id_idx
on public.notification_subscriptions (producer_id);

create index notification_subscriptions_enabled_idx
on public.notification_subscriptions (producer_id, enabled);

create index notifications_user_id_created_at_idx
on public.notifications (user_id, created_at desc);

create index notifications_producer_id_created_at_idx
on public.notifications (producer_id, created_at desc);

create index notifications_unread_idx
on public.notifications (user_id, read_at)
where read_at is null;

create index notifications_event_type_idx
on public.notifications (event_type);

create index notification_preferences_producer_id_idx
on public.notification_preferences (producer_id);

alter table public.notification_subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;

create policy "Users can read own notification subscriptions"
on public.notification_subscriptions for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "Users can insert own notification subscriptions"
on public.notification_subscriptions for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.producers
    where producers.id = notification_subscriptions.producer_id
      and producers.user_id = auth.uid()
  )
);

create policy "Users can update own notification subscriptions"
on public.notification_subscriptions for update
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
)
with check (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "Users can delete own notification subscriptions"
on public.notification_subscriptions for delete
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "Users can read own notifications"
on public.notifications for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "Users can update own notifications"
on public.notifications for update
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
)
with check (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "Users can read own notification preferences"
on public.notification_preferences for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "Users can insert own notification preferences"
on public.notification_preferences for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.producers
    where producers.id = notification_preferences.producer_id
      and producers.user_id = auth.uid()
  )
);

create policy "Users can update own notification preferences"
on public.notification_preferences for update
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
)
with check (
  user_id = auth.uid()
  or public.is_admin()
);

grant select, insert, update, delete on table public.notification_subscriptions to authenticated;
grant select, update on table public.notifications to authenticated;
grant select, insert, update on table public.notification_preferences to authenticated;

create or replace function public.ensure_notification_preferences(
  p_user_id uuid,
  p_producer_id uuid
)
returns public.notification_preferences
language plpgsql
security definer
set search_path = public
as $$
declare
  v_preferences public.notification_preferences;
begin
  insert into public.notification_preferences (user_id, producer_id)
  values (p_user_id, p_producer_id)
  on conflict (user_id, producer_id) do update
    set updated_at = public.notification_preferences.updated_at
  returning * into v_preferences;

  return v_preferences;
end;
$$;

create or replace function public.create_notification_for_payment_event(
  p_payment_id uuid,
  p_status public.payment_status,
  p_provider_event_type text default null
)
returns table (
  notification_id uuid,
  user_id uuid,
  producer_id uuid,
  event_type public.notification_event_type,
  title text,
  body text,
  target_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments;
  v_order public.orders;
  v_producer public.producers;
  v_preferences public.notification_preferences;
  v_event_type public.notification_event_type;
  v_title text;
  v_body text;
  v_target_url text;
  v_notification_id uuid;
  v_should_create boolean := true;
begin
  select *
    into v_payment
  from public.payments
  where id = p_payment_id;

  if not found then
    return;
  end if;

  select *
    into v_order
  from public.orders
  where id = v_payment.order_id;

  if not found then
    return;
  end if;

  select *
    into v_producer
  from public.producers
  where id = v_order.producer_id;

  if not found then
    return;
  end if;

  v_preferences := public.ensure_notification_preferences(v_producer.user_id, v_producer.id);

  if p_status = 'paid'::public.payment_status then
    v_event_type := 'sale_approved'::public.notification_event_type;
    v_title := 'Nova venda aprovada';
    v_body := 'Uma venda foi aprovada na Velto Pay.';
    v_target_url := '/dashboard';
    v_should_create := v_preferences.sales_enabled;
  elsif p_status = 'pending'::public.payment_status then
    v_event_type := 'payment_pending'::public.notification_event_type;
    v_title := 'Pagamento pendente';
    v_body := 'Um pagamento foi iniciado e aguarda confirmação.';
    v_target_url := '/dashboard/checkout';
    v_should_create := v_preferences.pix_enabled;
  elsif p_status = 'processing'::public.payment_status then
    v_event_type := 'pix_created'::public.notification_event_type;
    v_title := 'Pix gerado';
    v_body := 'Um Pix foi gerado e aguarda pagamento.';
    v_target_url := '/dashboard/checkout';
    v_should_create := v_preferences.pix_enabled;
  elsif p_status = 'failed'::public.payment_status then
    v_event_type := 'payment_failed'::public.notification_event_type;
    v_title := 'Pagamento recusado';
    v_body := 'Um pagamento foi recusado no checkout.';
    v_target_url := '/dashboard/checkout';
    v_should_create := v_preferences.failed_payments_enabled;
  elsif p_status = 'refunded'::public.payment_status then
    v_event_type := 'refund_created'::public.notification_event_type;
    v_title := 'Reembolso realizado';
    v_body := 'Um reembolso foi registrado na sua operação.';
    v_target_url := '/dashboard/financeiro';
    v_should_create := v_preferences.refunds_enabled;
  elsif p_status = 'chargeback'::public.payment_status then
    v_event_type := 'chargeback_created'::public.notification_event_type;
    v_title := 'Chargeback recebido';
    v_body := 'Um chargeback foi registrado na sua operação.';
    v_target_url := '/dashboard/financeiro';
    v_should_create := v_preferences.chargebacks_enabled;
  elsif p_status = 'cancelled'::public.payment_status then
    v_event_type := 'pix_expired'::public.notification_event_type;
    v_title := 'Pagamento expirado';
    v_body := 'Um pagamento foi cancelado ou expirou antes da confirmação.';
    v_target_url := '/dashboard/checkout';
    v_should_create := v_preferences.pix_enabled;
  else
    v_event_type := 'payment_pending'::public.notification_event_type;
    v_title := 'Pagamento atualizado';
    v_body := 'Um pagamento recebeu uma atualização de status.';
    v_target_url := '/dashboard/checkout';
    v_should_create := v_preferences.financial_enabled;
  end if;

  if not v_should_create then
    return;
  end if;

  insert into public.notifications (
    user_id,
    producer_id,
    event_type,
    title,
    body,
    data
  )
  values (
    v_producer.user_id,
    v_producer.id,
    v_event_type,
    v_title,
    v_body,
    jsonb_build_object(
      'payment_id', v_payment.id,
      'order_id', v_order.id,
      'status', p_status,
      'provider_event_type', p_provider_event_type,
      'target_url', v_target_url
    )
  )
  returning id into v_notification_id;

  return query
    select
      v_notification_id,
      v_producer.user_id,
      v_producer.id,
      v_event_type,
      v_title,
      v_body,
      v_target_url;
end;
$$;

grant execute on function public.ensure_notification_preferences(uuid, uuid) to authenticated;
grant execute on function public.create_notification_for_payment_event(
  uuid,
  public.payment_status,
  text
) to anon, authenticated;

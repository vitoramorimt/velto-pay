begin;

alter type public.order_status add value if not exists 'cancelled';

grant select on table public.checkouts to anon, authenticated;
grant insert, update, delete on table public.checkouts to authenticated;

insert into public.checkouts (
  producer_id,
  product_id,
  slug,
  status,
  headline,
  description,
  published_at
)
select
  products.producer_id,
  products.id,
  case
    when exists (
      select 1
      from public.checkouts existing_checkouts
      where existing_checkouts.slug = products.slug
    ) then products.slug || '-' || substr(replace(products.id::text, '-', ''), 1, 8)
    else products.slug
  end,
  case
    when products.status = 'active' then 'published'::public.checkout_status
    when products.status = 'draft' then 'draft'::public.checkout_status
    else 'disabled'::public.checkout_status
  end,
  products.name,
  products.description,
  case when products.status = 'active' then now() else null end
from public.products
where not exists (
  select 1
  from public.checkouts
  where checkouts.product_id = products.id
);

create unique index if not exists checkouts_product_id_unique_idx
on public.checkouts (product_id);

create index if not exists checkouts_producer_created_at_idx
on public.checkouts (producer_id, created_at desc);

create or replace function public.create_pending_checkout_order(
  p_checkout_slug text,
  p_customer_name text,
  p_customer_email text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_checkout record;
  v_customer_id uuid;
  v_order_id uuid;
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
    subtotal_cents,
    discount_cents,
    total_cents,
    currency,
    metadata
  )
  values (
    v_checkout.producer_id,
    v_checkout.product_id,
    v_checkout.checkout_id,
    v_customer_id,
    'pending'::public.order_status,
    v_checkout.price_cents,
    0,
    v_checkout.price_cents,
    v_checkout.currency,
    jsonb_build_object('source', 'public_checkout')
  )
  returning id into v_order_id;

  return v_order_id;
end;
$$;

grant execute on function public.create_pending_checkout_order(text, text, text)
to anon, authenticated;

commit;

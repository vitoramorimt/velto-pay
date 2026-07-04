drop policy if exists "Public can view active products" on public.products;
drop policy if exists "Producers can manage own products" on public.products;
drop policy if exists "Public can view published checkouts" on public.checkouts;
drop policy if exists "Producers can manage own checkouts" on public.checkouts;
drop policy if exists "Public can create customers" on public.customers;
drop policy if exists "Admins can manage customers" on public.customers;
drop policy if exists "Public can create pending orders" on public.orders;
drop policy if exists "Producers and affiliates can view related orders" on public.orders;
drop policy if exists "Admins can manage orders" on public.orders;
drop policy if exists "Producers can view related payments" on public.payments;
drop policy if exists "Admins can manage payments" on public.payments;

grant select on table public.products to anon, authenticated;
grant insert, update on table public.products to authenticated;

grant select on table public.checkouts to anon, authenticated;
grant insert, update, delete on table public.checkouts to authenticated;

grant insert on table public.customers to anon, authenticated;
grant select on table public.customers to authenticated;

grant insert on table public.orders to anon, authenticated;
grant select on table public.orders to authenticated;

grant select on table public.payments to authenticated;

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

create policy "Public can create customers"
on public.customers for insert
to anon, authenticated
with check (true);

create policy "Admins can manage customers"
on public.customers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

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

alter table public.checkout_offers
add column if not exists product_id uuid references public.products(id) on delete cascade;

create unique index if not exists checkout_offers_checkout_product_idx
on public.checkout_offers (checkout_id, product_id)
where product_id is not null;

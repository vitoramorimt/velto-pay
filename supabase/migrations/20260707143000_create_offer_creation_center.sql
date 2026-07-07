alter table public.products
  add column if not exists category text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_category_length_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_category_length_check check (
        category is null or char_length(category) <= 80
      );
  end if;
end $$;

alter table public.checkouts
  add column if not exists logo_url text,
  add column if not exists banner_url text,
  add column if not exists secure_purchase_enabled boolean;

update public.checkouts
set secure_purchase_enabled = true
where secure_purchase_enabled is null;

alter table public.checkouts
  alter column secure_purchase_enabled set default true,
  alter column secure_purchase_enabled set not null;

create table if not exists public.product_offer_contents (
  id uuid primary key default extensions.gen_random_uuid(),
  producer_id uuid not null references public.producers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  benefits jsonb not null default '[]'::jsonb,
  guarantee text,
  faqs jsonb not null default '[]'::jsonb,
  testimonials jsonb not null default '[]'::jsonb,
  bonuses jsonb not null default '[]'::jsonb,
  countdown_enabled boolean not null default false,
  countdown_ends_at timestamptz,
  urgency_text text,
  trust_seals jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_offer_contents_product_unique unique (product_id),
  constraint product_offer_contents_guarantee_length_check check (
    guarantee is null or char_length(guarantee) <= 220
  ),
  constraint product_offer_contents_urgency_length_check check (
    urgency_text is null or char_length(urgency_text) <= 160
  )
);

drop trigger if exists product_offer_contents_set_updated_at on public.product_offer_contents;

create trigger product_offer_contents_set_updated_at
before update on public.product_offer_contents
for each row execute function public.set_updated_at();

create index if not exists product_offer_contents_producer_idx
on public.product_offer_contents (producer_id, updated_at desc);

alter table public.product_offer_contents enable row level security;

drop policy if exists "Public can view published offer content" on public.product_offer_contents;
create policy "Public can view published offer content"
on public.product_offer_contents for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    join public.checkouts on checkouts.product_id = products.id
    where products.id = product_offer_contents.product_id
      and products.status = 'active'::public.product_status
      and checkouts.status = 'published'::public.checkout_status
  )
);

drop policy if exists "Producers can manage own offer content" on public.product_offer_contents;
create policy "Producers can manage own offer content"
on public.product_offer_contents for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = product_offer_contents.producer_id
      and producers.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.producers
    where producers.id = product_offer_contents.producer_id
      and producers.user_id = auth.uid()
  )
);

grant select on table public.product_offer_contents to anon, authenticated;
grant insert, update, delete on table public.product_offer_contents to authenticated;

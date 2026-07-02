-- Table privileges are required in addition to RLS policies.
grant usage on schema public to anon, authenticated;

grant select on table public.producers to authenticated;

grant select on table public.products to anon, authenticated;
grant insert, update on table public.products to authenticated;

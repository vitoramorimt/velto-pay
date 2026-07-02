begin;

grant select on table public.orders to authenticated;
grant select on table public.payments to authenticated;
grant select on table public.customers to authenticated;

commit;

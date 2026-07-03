begin;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.producers'::regclass
      and conname = 'producers_user_id_key'
      and contype = 'u'
  ) then
    alter table public.producers
      add constraint producers_user_id_key unique (user_id);
  end if;
end;
$$;

insert into public.producers (user_id, brand_name, status)
select
  users.id,
  nullif(users.full_name, ''),
  'pending'::public.producer_status
from public.users
where not exists (
  select 1
  from public.producers
  where producers.user_id = users.id
)
on conflict (user_id) do nothing;

commit;

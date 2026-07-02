begin;

grant usage on schema public to anon, authenticated;

grant select on table public.users to authenticated;
grant select on table public.producers to authenticated;
grant insert, update on table public.producers to authenticated;

grant select on table public.products to anon, authenticated;
grant insert, update on table public.products to authenticated;

insert into public.users (id, email, full_name, avatar_url, role)
select
  auth_users.id,
  coalesce(auth_users.email, ''),
  auth_users.raw_user_meta_data ->> 'full_name',
  auth_users.raw_user_meta_data ->> 'avatar_url',
  case
    when auth_users.raw_app_meta_data ->> 'role' in ('admin', 'producer', 'affiliate', 'support')
      then (auth_users.raw_app_meta_data ->> 'role')::public.user_role
    when auth_users.raw_user_meta_data ->> 'role' in ('admin', 'producer', 'affiliate', 'support')
      then (auth_users.raw_user_meta_data ->> 'role')::public.user_role
    else 'producer'::public.user_role
  end
from auth.users as auth_users
where not exists (
  select 1
  from public.users
  where users.id = auth_users.id
);

insert into public.producers (user_id, brand_name, status)
select users.id, nullif(users.full_name, ''), 'pending'::public.producer_status
from public.users
where not exists (
  select 1
  from public.producers
  where producers.user_id = users.id
);

commit;

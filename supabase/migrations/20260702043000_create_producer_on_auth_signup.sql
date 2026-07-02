create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when new.raw_app_meta_data ->> 'role' in ('admin', 'producer', 'affiliate', 'support')
        then (new.raw_app_meta_data ->> 'role')::public.user_role
      when new.raw_user_meta_data ->> 'role' in ('admin', 'producer', 'affiliate', 'support')
        then (new.raw_user_meta_data ->> 'role')::public.user_role
      else 'producer'::public.user_role
    end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.users.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
        role = excluded.role,
        updated_at = now();

  insert into public.producers (user_id, brand_name, status)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'pending'::public.producer_status
  )
  on conflict (user_id) do update
    set brand_name = coalesce(public.producers.brand_name, excluded.brand_name),
        updated_at = now();

  return new;
end;
$$;

insert into public.producers (user_id, brand_name, status)
select users.id, nullif(users.full_name, ''), 'pending'::public.producer_status
from public.users
where not exists (
  select 1
  from public.producers
  where producers.user_id = users.id
);

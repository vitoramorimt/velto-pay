begin;

grant usage on schema public to anon, authenticated;

grant select on table public.users to authenticated;
grant select on table public.producers to authenticated;
grant insert, update on table public.producers to authenticated;

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    'producer'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_user_role() in ('admin', 'support');
$$;

drop policy if exists "Users can view themselves" on public.users;
drop policy if exists "Users can update themselves" on public.users;
drop policy if exists "Admins can manage users" on public.users;
drop policy if exists "Producers can view own producer record" on public.producers;
drop policy if exists "Users can create own producer record" on public.producers;
drop policy if exists "Producers can update own producer record" on public.producers;

create policy "Users can view themselves"
on public.users for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "Users can update themselves"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can manage users"
on public.users for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Producers can view own producer record"
on public.producers for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users can create own producer record"
on public.producers for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

create policy "Producers can update own producer record"
on public.producers for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

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

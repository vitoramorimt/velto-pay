begin;

do $$
begin
  if not exists (
    select 1
    from pg_type
    join pg_namespace on pg_namespace.oid = pg_type.typnamespace
    where pg_namespace.nspname = 'public'
      and pg_type.typname = 'product_type'
  ) then
    create type public.product_type as enum ('one_time');
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'product_type'
  ) then
    alter table public.products
      add column product_type public.product_type not null default 'one_time'::public.product_type;
  end if;
end;
$$;

commit;

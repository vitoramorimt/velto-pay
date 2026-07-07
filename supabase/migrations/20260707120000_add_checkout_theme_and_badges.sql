alter table public.checkouts
  add column if not exists theme text,
  add column if not exists badges jsonb;

alter table public.checkouts
  alter column theme set default 'dark',
  alter column theme set not null,
  alter column badges set default '[
    {"id":"secure_payment","label":"Pagamento 100% seguro","enabled":true},
    {"id":"guarantee","label":"Garantia de 7 dias","enabled":true},
    {"id":"support","label":"Suporte dedicado","enabled":true}
  ]'::jsonb,
  alter column badges set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'checkouts_theme_check'
      and conrelid = 'public.checkouts'::regclass
  ) then
    alter table public.checkouts
      add constraint checkouts_theme_check check (theme in ('dark', 'light'));
  end if;
end $$;

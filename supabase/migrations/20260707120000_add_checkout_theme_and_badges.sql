alter table public.checkouts
  add column theme text not null default 'dark',
  add column badges jsonb not null default '[
    {"id":"secure_payment","label":"Pagamento 100% seguro","enabled":true},
    {"id":"guarantee","label":"Garantia de 7 dias","enabled":true},
    {"id":"support","label":"Suporte dedicado","enabled":true}
  ]'::jsonb;

alter table public.checkouts
  add constraint checkouts_theme_check check (theme in ('dark', 'light'));

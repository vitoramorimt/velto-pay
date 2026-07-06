# Autenticação

A Velto Pay usa Supabase Auth com e-mail e senha.

## Fluxos

- Cadastro.
- Login.
- Recuperação de senha.
- Redefinição de senha.
- Logout.
- Middleware de sessão.

## Onboarding

Triggers garantem que novos usuários tenham registros em `public.users` e `public.producers`.

## Segurança

- Cookies seguros via `@supabase/ssr`.
- Rotas privadas protegidas por middleware e guards.
- RLS reforça isolamento por produtor.

# Desenvolvimento

## Setup

```bash
corepack enable
corepack pnpm install
cp .env.example .env.local
corepack pnpm dev
```

## Supabase

```bash
corepack pnpm supabase:start
corepack pnpm supabase:db:reset
corepack pnpm supabase:gen-types
```

## Push notifications

Para testar notificações no PWA:

```bash
corepack pnpm exec web-push generate-vapid-keys
```

Preencha no `.env.local`:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `SUPABASE_SERVICE_ROLE_KEY`

Em desenvolvimento, use `localhost` ou HTTPS. No iOS, valide também com o PWA
instalado na tela inicial.

## Validação

```bash
corepack pnpm lint
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```

## Git

Nunca trabalhar direto na `main`. Use branches `codex/<escopo>` para novas funcionalidades.

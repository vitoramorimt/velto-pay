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

## Validação

```bash
corepack pnpm lint
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```

## Git

Nunca trabalhar direto na `main`. Use branches `codex/<escopo>` para novas funcionalidades.

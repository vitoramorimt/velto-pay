# Deploy

Deploy alvo: Vercel.

## Ambientes

- Development: máquina local.
- Sandbox: Stripe test + Supabase staging/local.
- Production: Vercel + Supabase production + Stripe live.

## Variáveis

- Supabase URL e anon key.
- `PAYMENT_PROVIDER`
- `PAYMENT_ENVIRONMENT`
- Stripe keys e webhook secret.

## Checklist

- `corepack pnpm lint`
- `corepack pnpm test`
- `corepack pnpm typecheck`
- `corepack pnpm build`
- Migrations aplicadas com autorização explícita.

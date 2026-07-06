# Velto Pay

Plataforma SaaS brasileira para produtores digitais venderem produtos com checkout próprio, pagamentos, dashboard, financeiro e IA comercial.

## Visão

A Velto Pay centraliza operação comercial, checkout, pagamentos, pedidos e finanças em uma experiência premium para produtores digitais. O produto usa Supabase como backend e Next.js como aplicação full-stack, com uma arquitetura preparada para múltiplos gateways.

## Tecnologias

- Next.js 15 com App Router
- TypeScript strict
- Tailwind CSS + shadcn/ui
- Supabase Auth, Database e RLS
- PostgreSQL com migrations versionadas
- React Hook Form + Zod
- TanStack Query
- Stripe Checkout em modo test
- Vitest
- Vercel

## Arquitetura

O projeto é organizado por módulos em `src/modules`:

- `auth`
- `products`
- `checkout`
- `orders`
- `payments`
- `dashboard`
- `finance`

Cada módulo separa domínio, aplicação, infraestrutura e apresentação quando aplicável. Acesso a dados fica em repositories server-only; mutações internas usam Server Actions; webhooks usam Route Handlers em Node runtime.

Leia mais em:

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/architecture.md](./docs/architecture.md)
- [docs/payments.md](./docs/payments.md)
- [docs/database.md](./docs/database.md)

## Rodando Localmente

```bash
corepack enable
corepack pnpm install
cp .env.example .env.local
corepack pnpm dev
```

A aplicação roda em `http://localhost:3000`.

## Ambiente

Configure `.env.local` com:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYMENT_PROVIDER=stripe
PAYMENT_ENVIRONMENT=sandbox
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SUCCESS_URL=http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=http://localhost:3000/checkout/cancel
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

## Supabase

```bash
corepack pnpm supabase:start
corepack pnpm supabase:db:reset
corepack pnpm supabase:gen-types
```

Migrations ficam em `supabase/migrations`. Não altere tabelas manualmente sem criar migration.

## Stripe

Use Stripe em modo test:

```bash
stripe listen --forward-to localhost:3000/api/payments/webhooks/stripe
```

Copie o `whsec_...` para `STRIPE_WEBHOOK_SECRET`.

Cartões de teste:

- Aprovado: `4242 4242 4242 4242`
- Recusado: `4000 0000 0000 0002`

Eventos úteis:

```bash
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
stripe trigger charge.dispute.created
```

## Testes e Validação

```bash
corepack pnpm lint
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```

## Contribuição

- Nunca trabalhar direto na `main`.
- Criar branch por funcionalidade.
- Fazer commits pequenos e descritivos.
- Manter RLS, migrations, use cases e repositories coerentes.
- Não expor service role ou secrets no frontend.

Veja [docs/contributing.md](./docs/contributing.md) e [docs/coding-standards.md](./docs/coding-standards.md).

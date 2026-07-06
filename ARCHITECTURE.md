# Arquitetura da Velto Pay

## Visão Geral

A Velto Pay é um SaaS full-stack em Next.js 15 para venda de produtos digitais. O backend operacional usa Supabase/PostgreSQL, autenticação via Supabase Auth, pagamentos via uma camada `PaymentProvider` multi-gateway e deploy alvo em Vercel.

## Frontend

- App Router com route groups `(public)`, `(auth)`, `(dashboard)` e `(checkout)`.
- Server Components por padrão.
- Client Components para formulários, modais, dropdowns e ações interativas.
- Tailwind CSS e shadcn/ui formam o Design System.
- Tema premium com suporte dark/light nas principais áreas.

## Backend

O backend fica dentro do próprio Next.js:

- Server Actions para mutações internas.
- Route Handlers para webhooks e APIs externas.
- Use cases em `src/modules/*/application`.
- Repositories em `src/modules/*/infrastructure`.
- Configuração server-only validada com Zod.

## Supabase

Supabase fornece:

- Auth
- PostgreSQL
- RLS
- migrations SQL
- tipos TypeScript em `src/shared/database.types.ts`

Service role não deve ser usada no frontend.

## Migrations

O schema é versionado em `supabase/migrations`. Toda mudança de tabela, enum, policy ou função deve ser incremental e acompanhada de atualização dos tipos.

## Repositories

Repositories encapsulam Supabase e expõem métodos de domínio. Eles não renderizam UI e não tomam decisões de navegação.

## Use Cases

Use cases coordenam:

- autenticação;
- validação de regras;
- chamadas a repositories;
- providers externos;
- revalidação/efeitos quando necessário.

## Server Actions

Server Actions recebem `FormData`, validam com Zod, chamam use cases e redirecionam/revalidam rotas. Elas não devem conter SQL nem lógica de gateway.

## Payment Providers

O contrato `PaymentProvider` define:

- `createCheckout`
- `capturePayment`
- `cancelPayment`
- `refund`
- `getPayment`
- `webhook`

Provider real atual: Stripe em sandbox/test.

Providers preparados: Mercado Pago, Asaas e Pagar.me.

## Orders

`orders` representa a intenção de compra criada no checkout. A venda só conta em métricas quando o pagamento associado muda para `paid` via webhook.

## Ledger

`ledger_entries` é append-only. Entradas financeiras são geradas por transições confirmadas de pagamento, reembolso e chargeback.

## Dashboard

Dashboard, Financeiro e IA leem dados reais filtrados por `producer_id`, nunca valores mockados.

## Fluxo Completo

1. Produtor cria produto.
2. Checkout público é gerado.
3. Comprador acessa `/pay/[slug]`.
4. Server Action valida dados.
5. Use case cria tentativa de pagamento.
6. Stripe Checkout é criado.
7. Comprador paga ou cancela.
8. Webhook assinado atualiza banco.
9. Métricas e financeiro refletem o estado real.

## Documentação Detalhada

Veja a pasta [`docs`](./docs) para detalhes por domínio.

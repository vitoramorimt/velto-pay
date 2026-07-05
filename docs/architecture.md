# Arquitetura da Velto Pay

A Velto Pay é uma aplicação SaaS full-stack construída com Next.js 15, Supabase e Vercel. A arquitetura segue módulos por domínio, com Server Components para leitura, Server Actions para mutações internas, Route Handlers para integrações externas e repositórios server-only para acesso ao banco.

## Camadas

- Frontend: App Router, React Server Components, Client Components apenas para interações.
- Presentation: páginas, formulários, dialogs, botões e Server Actions.
- Application: use cases que coordenam autenticação, regras e repositórios.
- Domain: tipos, schemas, normalizadores e contratos de provider.
- Infrastructure: Supabase repositories, adapters de pagamento e integrações externas.

## Módulos Atuais

- `auth`: login, cadastro, recuperação de senha, sessão e logout.
- `products`: CRUD de produtos digitais e status.
- `checkout`: links públicos, página `/pay/[slug]` e ações de compra.
- `payments`: contrato multi-provider e Stripe sandbox real.
- `orders`: leitura de pedidos por produtor.
- `dashboard`: métricas reais por produtor.
- `finance`: saldos, ledger e histórico financeiro.

## Fluxo Principal

1. Produtor cria produto autenticado.
2. Sistema cria ou atualiza checkout público.
3. Comprador acessa `/pay/[slug]`.
4. Server Action valida dados e inicia pagamento.
5. Payment use case seleciona provider por `PAYMENT_PROVIDER`.
6. Stripe cria Checkout Session em modo test.
7. Webhook assinado confirma pagamento.
8. RPC atualiza `payments`, `orders`, `transactions`, `ledger_entries`, `payment_events` e `outbox_events`.
9. Dashboard e Financeiro leem dados reais do Supabase.

## Princípios

- Nenhum dado financeiro confiável vem do frontend.
- Service role nunca é usado no browser.
- Ledger e payment events são append-only.
- Migrations são a fonte de verdade do schema.
- Providers de pagamento implementam a mesma interface.

# Roadmap da Velto Pay

## Sprints Concluídas

### Sprint 1 — Bootstrap Técnico

Objetivo: criar a base Next.js 15 com TypeScript strict, Tailwind, shadcn/ui, aliases, Supabase e env validation.

Entregas: aplicação inicial, estrutura de pastas, lint/typecheck/build.

### Sprint 2 — Design System

Objetivo: definir identidade premium da Velto Pay.

Entregas: tokens, componentes, sidebar, header, cards, inputs, tables, badges, toasts, skeletons e responsividade.

### Sprint 3 — Autenticação

Objetivo: implementar Supabase Auth.

Entregas: login, cadastro, recuperação de senha, logout, providers, guards, middleware e layouts público/privado.

### Sprint 3.5 — Infraestrutura Supabase

Objetivo: versionar o banco.

Entregas: `supabase/`, config, migrations, seed, scripts CLI e fluxo documentado.

### Sprint 4 — Banco de Dados

Objetivo: criar schema inicial.

Entregas: users, producers, products, checkouts, orders, customers, payments, affiliates, commissions, withdrawals, ledger, events, outbox, RLS e types.

### Sprint 5 — Produtos

Objetivo: permitir gestão de produtos.

Entregas: listagem, criação, edição, ativação/inativação, validação Zod, Server Actions e Supabase.

### Sprint 6 — Dashboard

Objetivo: criar visão principal do produtor.

Entregas: métricas reais por produtor, gráfico, últimas vendas, estado vazio e IA de Vendas visual.

### Sprint 7 — Core Comercial

Objetivo: conectar produtos, checkout, financeiro e links públicos.

Entregas: links `/pay/[slug]`, aba Checkout, Financeiro, dashboard simplificado e fluxo público.

### Sprint 8 — Estabilização

Objetivo: estabilizar UX, responsividade e fluxos reais.

Entregas: ajustes em landing, login, cadastro, produtos, checkout, financeiro, IA, tema e navegação.

### Sprint 9 — Payment Gateway Foundation

Objetivo: criar arquitetura multi-provider.

Entregas: módulo `payments`, interface `PaymentProvider`, providers preparados, webhooks, transactions, refunds e base financeira.

### Sprint 10 — Stripe Sandbox

Objetivo: implementar o primeiro gateway real.

Entregas: Stripe Checkout test, success/cancel, webhook assinado, eventos Stripe e testes do provider.

## Próximas Sprints

### Sprint 11 — Checkout Premium

Objetivo: aumentar conversão do checkout público.

Entregas:

- Order bump.
- Upsell e downsell.
- Cupons percentuais e fixos.
- Limite de uso e expiração.
- Meta Pixel, Google Analytics, Google Tag Manager e TikTok Pixel.
- UTM tracking.
- Resumo do pedido.
- Garantias, badges de segurança e página de obrigado.

Arquitetura: extensão do módulo `checkout`, novas tabelas versionadas, cálculo server-side e metadata segura para payments.

Critérios de aceite:

- Checkout funciona sem configurações premium.
- Cupons são validados no servidor.
- Total enviado ao Stripe é calculado no servidor.
- Pixels só renderizam quando configurados.
- UTMs são persistidas no pedido.

### Sprint 12 — Área do Comprador

Objetivo: criar portal para compradores acessarem compras.

Entregas: login por e-mail, lista de compras, detalhes do pedido e acesso ao produto.

Arquitetura: módulo buyer portal com RLS por e-mail/token.

Critérios de aceite: comprador vê apenas compras próprias.

### Sprint 13 — Assinaturas

Objetivo: vender produtos recorrentes.

Entregas: planos, cobranças recorrentes, cancelamento e webhooks de assinatura.

Arquitetura: extensão de products, orders e payments para billing cycles.

Critérios de aceite: assinatura test no Stripe atualiza status e financeiro.

### Sprint 14 — Afiliados

Objetivo: ativar aquisição por afiliados.

Entregas: links, comissões, tracking cookie, dashboard do afiliado e regras de comissão.

Arquitetura: módulo affiliate com ledger integrado.

Critérios de aceite: venda via afiliado registra comissão sem vazar dados.

### Sprint 15 — Analytics

Objetivo: criar analytics comercial avançado.

Entregas: funil, conversão por produto, origem, cohorts e exportação.

Arquitetura: eventos de checkout e agregações por produtor.

Critérios de aceite: métricas por produtor consistentes e performáticas.

### Sprint 16 — IA Comercial

Objetivo: transformar dados em recomendações.

Entregas: insights, perguntas, alertas, sugestões de copy e análise de checkout.

Arquitetura: serviço server-side com dados agregados e proteção de PII.

Critérios de aceite: IA não acessa dados de outros produtores.

### Sprint 17 — Marketplace

Objetivo: permitir descoberta de produtos e afiliados.

Entregas: vitrine pública, categorias, busca e inscrição de afiliados.

Arquitetura: catálogo público com filtros e políticas separadas.

Critérios de aceite: somente produtos elegíveis aparecem.

### Sprint 18 — Escalabilidade

Objetivo: preparar alto volume.

Entregas: cache, rate limiting, filas, observabilidade, particionamento lógico e hardening.

Arquitetura: Redis/queue, outbox processor, índices e métricas.

Critérios de aceite: fluxos críticos suportam carga com degradação controlada.

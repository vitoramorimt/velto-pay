# Velto Pay — Roadmap

> Planejamento estratégico de produto. Versão 2.0 — Stack Oficial.

---

## Visão Geral

```
2026 Q3          2026 Q4          2027 Q1          2027 Q2+
   │                │                │                │
   ▼                ▼                ▼                ▼
 MVP              V2               V3            Growth
(Fundação)    (Escala)        (Plataforma)     (Expansão)
```

**Stack:** Next.js 15 · Supabase · Vercel · Upstash Redis · Payment Service · Sentry

**Referências:** [PROJECT.md](./PROJECT.md) · [PRD.md](./PRD.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## MVP — Fundação

> **Objetivo:** Produtor consegue criar produto, gerar checkout e receber pagamentos via PIX e cartão.
> **Prazo estimado:** 8–12 semanas
> **Critério de sucesso:** Primeiro produtor real processando pagamentos reais

### Fase 0 — Setup (Semanas 1–2)

| # | Entrega | Descrição |
|---|---|---|
| 0.1 | Projeto Next.js 15 | App Router, TypeScript, Tailwind CSS, shadcn/ui |
| 0.2 | Supabase | Projeto criado: Database, Auth, Storage, Realtime habilitados |
| 0.3 | Database schema | Migrations SQL: profiles, products, transactions, checkout_sessions |
| 0.4 | RLS policies | Row Level Security em todas as tabelas de negócio |
| 0.5 | Vercel + CI/CD | GitHub Actions: lint, typecheck, test, deploy preview e produção |
| 0.6 | Upstash Redis | Instância criada, client configurado, rate limiting base |
| 0.7 | Sentry | Error tracking e performance monitoring configurados |
| 0.8 | Payment Service | Interface multi-provider `PaymentProvider` + um PSP real inicial (Mercado Pago ou Pagar.me) |
| 0.9 | Supabase types | Geração automática de types TypeScript via Supabase CLI |

### Fase 1 — Auth & Onboarding (Semanas 3–4)

| # | Entrega | Descrição |
|---|---|---|
| 1.1 | Supabase Auth | Cadastro, login, logout via Server Actions |
| 1.2 | Verificação de e-mail | Flow nativo Supabase Auth |
| 1.3 | Recuperação de senha | Flow nativo Supabase Auth |
| 1.4 | Middleware | Proteção de rotas `(dashboard)` e `(admin)` via `@supabase/ssr` |
| 1.5 | Onboarding guiado | Wizard pós-cadastro (dados pessoais, CPF/CNPJ) |
| 1.6 | KYC básico | Upload de documentos via Supabase Storage, status pending/approved/rejected |
| 1.7 | Dashboard shell | Layout base: sidebar, header, navegação (Server Components) |

### Fase 2 — Produtos & Checkout (Semanas 5–7)

| # | Entrega | Descrição |
|---|---|---|
| 2.1 | CRUD de produtos | Server Actions: criar, editar, ativar/desativar |
| 2.2 | Upload de imagem | Supabase Storage bucket `product-images` |
| 2.3 | Link de checkout | Geração de slug único, rota `(checkout)/[slug]` |
| 2.4 | Página de checkout | Server Component responsivo, mobile-first, coleta de dados |
| 2.5 | Cache de produto | Upstash Redis — TTL 5 min, invalidação em update |
| 2.6 | Checkout PIX | QR Code + copia-e-cola via Payment Service, countdown 15 min |
| 2.7 | Checkout cartão | Tokenização via PSP, parcelamento |
| 2.8 | Confirmação PIX | Supabase Realtime subscribe + fallback polling |
| 2.9 | Páginas de resultado | Sucesso, erro, expirado |

### Fase 3 — Pagamentos & Finanças (Semanas 8–10)

| # | Entrega | Descrição |
|---|---|---|
| 3.1 | Provider primário | Mercado Pago ou Pagar.me integrado como único PSP real inicial (PIX + cartão) |
| 3.2 | Route Handlers | Webhooks: `/api/webhooks/mercadopago` (ou pagarme) |
| 3.3 | Webhook hardening | Node runtime, raw body, validação de assinatura, resposta rápida |
| 3.4 | Idempotência | Upstash Redis + constraints no banco para pagamentos e webhooks |
| 3.5 | Eventos de pagamento | `payment_events` append-only para eventos recebidos dos PSPs |
| 3.6 | Ledger financeiro | Ledger append-only para venda, taxa, retenção, liberação, saque, estorno e chargeback |
| 3.7 | Outbox | `outbox_events` para e-mails, reconciliação e efeitos assíncronos |
| 3.8 | Split de pagamento | Plataforma + produtor (+ afiliado placeholder) |
| 3.9 | Saldo e extrato | Server Actions + Supabase: saldo disponível/pendente derivado do ledger |
| 3.10 | Período de retenção | D+7 escrow via ledger e jobs agendados |
| 3.11 | Saques | Server Action: solicitação, validação KYC, processamento |
| 3.12 | Taxas | Cálculo e dedução automática por transação |

### Fase 4 — Notificações & Analytics (Semanas 11–12)

| # | Entrega | Descrição |
|---|---|---|
| 4.1 | E-mails transacionais | Resend via Server Action: compra, venda, saque, senha |
| 4.2 | Dashboard analytics | Server Components: vendas, conversão, gráfico de receita |
| 4.3 | Admin mínimo | Aprovação/rejeição de KYC e produtores, com auditoria |
| 4.4 | Auditoria | Tabela `audit_logs` + triggers em operações financeiras |
| 4.5 | Testes E2E | Playwright: cadastro → produto → checkout → pagamento PIX |
| 4.6 | Go-live | Deploy produção Vercel, primeiros produtores beta |

### MVP — Resumo de Entregas

```
✓ Next.js 15 full-stack com Supabase (DB, Auth, Storage, Realtime)
✓ Auth via Supabase Auth + middleware
✓ Onboarding + KYC (Supabase Storage)
✓ CRUD de produtos (Server Actions)
✓ Checkout público (PIX + cartão via Payment Service com um PSP real inicial)
✓ Webhooks via Route Handlers em Node runtime, raw body e validação de assinatura
✓ Confirmação PIX via Supabase Realtime
✓ Dashboard financeiro (saldo, extrato, saque)
✓ E-mails transacionais
✓ Analytics básico
✓ Admin mínimo (KYC e produtores)
✓ Ledger financeiro append-only + payment_events + outbox_events
✓ CI/CD GitHub Actions → Vercel
✓ Sentry + Upstash Redis
```

---

## V2 — Escala e Conversão

> **Objetivo:** Aumentar conversão, reter produtores e escalar operação.
> **Prazo estimado:** 12–16 semanas após MVP
> **Critério de sucesso:** 100+ produtores ativos, taxa de conversão > 70%

### V2.1 — Conversão Avançada

| # | Entrega | Prioridade |
|---|---|---|
| V2.1.1 | Order bump no checkout | Alta |
| V2.1.2 | Upsell one-click pós-compra | Alta |
| V2.1.3 | Recuperação de carrinho abandonado (e-mail) | Alta |
| V2.1.4 | Cupons de desconto | Média |
| V2.1.5 | Customização visual do checkout (logo, cores via Storage) | Média |
| V2.1.6 | A/B testing de checkout | Média |
| V2.1.7 | Funil de conversão detalhado | Média |

### V2.2 — Afiliados

| # | Entrega | Prioridade |
|---|---|---|
| V2.2.1 | Programa de afiliados por produto | Alta |
| V2.2.2 | Links exclusivos + rastreamento cookie (Upstash) | Alta |
| V2.2.3 | Dashboard do afiliado | Alta |
| V2.2.4 | Comissões automáticas via split Payment Service | Alta |
| V2.2.5 | Configuração de comissão por produto | Média |

### V2.3 — Assinaturas

| # | Entrega | Prioridade |
|---|---|---|
| V2.3.1 | Produto recorrente (mensal/anual) | Alta |
| V2.3.2 | Cobrança automática via Payment Service | Alta |
| V2.3.3 | Gestão de inadimplência (dunning) | Média |
| V2.3.4 | Portal do assinante (cancelamento, upgrade) | Média |

### V2.4 — Multi-PSP & API

| # | Entrega | Prioridade |
|---|---|---|
| V2.4.1 | Segundo PSP integrado (Stripe ou provider restante) | Alta |
| V2.4.2 | Roteamento/fallback automático entre providers | Alta |
| V2.4.3 | Circuit breaker por provider (Upstash) | Média |
| V2.4.4 | API REST pública via Route Handlers (OpenAPI) | Alta |
| V2.4.5 | Autenticação via API Key | Alta |
| V2.4.6 | Webhooks configuráveis pelo produtor | Alta |
| V2.4.7 | OAuth login Google (Supabase Auth) | Média |
| V2.4.8 | 2FA (Supabase Auth) | Média |

### V2.5 — Admin & Operações

| # | Entrega | Prioridade |
|---|---|---|
| V2.5.1 | Painel admin completo | Alta |
| V2.5.2 | Gestão de taxas por produtor | Média |
| V2.5.3 | Estornos (refund) via Payment Service | Alta |
| V2.5.4 | Gestão de chargebacks | Alta |
| V2.5.5 | Feature flags (Upstash Redis) | Média |
| V2.5.6 | KYC automatizado (parceiro) | Média |

### V2.6 — Infraestrutura

| # | Entrega | Prioridade |
|---|---|---|
| V2.6.1 | Supabase Pro (read replicas, PITR) | Alta |
| V2.6.2 | Vercel Pro (mais bandwidth, analytics, observabilidade e controles de produção) | Alta |
| V2.6.3 | Sentry Performance (APM completo) | Média |
| V2.6.4 | Domínio customizado checkout (Vercel Domains/DNS) | Média |
| V2.6.5 | Notificações in-app via Supabase Realtime | Média |
| V2.6.6 | Vercel Cron Jobs para reconciliação, e-mails de recuperação e fechamento financeiro | Média |

### V2 — Resumo de Entregas

```
✓ Order bump + upsell + recuperação de carrinho
✓ Programa de afiliados completo
✓ Assinaturas recorrentes
✓ Multi-PSP com fallback (Stripe + MP + Pagar.me)
✓ API pública + webhooks
✓ Admin completo + estornos + chargebacks
✓ Infra escalável (Supabase Pro + Vercel Pro)
```

---

## V3 — Plataforma

> **Objetivo:** Transformar Velto Pay em plataforma completa de monetização digital.
> **Prazo estimado:** 16–20 semanas após V2
> **Critério de sucesso:** R$ 1M+ GMV/mês, expansão LATAM iniciada

### V3.1 — Monetização Avançada

| # | Entrega | Prioridade |
|---|---|---|
| V3.1.1 | Antecipação de recebíveis | Alta |
| V3.1.2 | Múltiplos planos por produto | Média |
| V3.1.3 | Pagamento via boleto (Payment Service) | Média |
| V3.1.4 | Split avançado (multi-produtor/co-produção) | Média |
| V3.1.5 | Nota fiscal automática | Média |

### V3.2 — Expansão Geográfica

| # | Entrega | Prioridade |
|---|---|---|
| V3.2.1 | Checkout multi-moeda (USD, EUR) via Stripe | Alta |
| V3.2.2 | Stripe como provider internacional no Payment Service | Alta |
| V3.2.3 | Localização (ES, EN) | Média |
| V3.2.4 | Compliance internacional (PCI, GDPR) | Alta |

### V3.3 — Plataforma & Ecossistema

| # | Entrega | Prioridade |
|---|---|---|
| V3.3.1 | SDK JavaScript/TypeScript | Alta |
| V3.3.2 | Marketplace de afiliados | Média |
| V3.3.3 | Área de membros integrada | Média |
| V3.3.4 | App mobile (React Native) | Baixa |
| V3.3.5 | Integrações nativas (Hotmart, RD Station, Zapier) | Média |

### V3.4 — Inteligência

| # | Entrega | Prioridade |
|---|---|---|
| V3.4.1 | Recomendações de otimização de checkout (AI) | Média |
| V3.4.2 | Scoring de fraude avançado | Alta |
| V3.4.3 | Previsão de churn de assinantes | Baixa |
| V3.4.4 | Benchmarking anônimo entre produtores | Baixa |

### V3.5 — Enterprise

| # | Entrega | Prioridade |
|---|---|---|
| V3.5.1 | SSO para equipes (Supabase Auth SAML) | Média |
| V3.5.2 | Multi-conta (agency model) | Média |
| V3.5.3 | SLA dedicado | Baixa |
| V3.5.4 | White-label | Baixa |

### V3 — Resumo de Entregas

```
✓ Antecipação de recebíveis
✓ Pagamentos internacionais (Stripe)
✓ SDK + marketplace de afiliados
✓ Inteligência de conversão (AI)
✓ Enterprise (SSO, multi-conta)
```

---

## Timeline Visual

```
         Jul/Ago 2026    Set/Out 2026    Nov/Dez 2026    Jan/Mar 2027    Abr/Jun 2027
              │               │               │               │               │
   MVP  ──────┤───────────────┤               │               │               │
   Fase 0-1   │               │               │               │               │
   Fase 2-3   │───────────────┤               │               │               │
   Fase 4     │               │               │               │               │
              │               │               │               │               │
   V2  ────────┼───────────────┼───────────────┤               │               │
   Conversão  │               │───────────────┤               │               │
   Multi-PSP  │               │       ────────┤               │               │
   API/Infra  │               │               │───────────────┤               │
              │               │               │               │               │
   V3  ────────┼───────────────┼───────────────┼───────────────┼───────────────┤
   Plataforma │               │               │               │───────────────┤
   LATAM      │               │               │               │       ────────┤
   Enterprise │               │               │               │               │
```

---

## Métricas por Fase

| Métrica | MVP | V2 | V3 |
|---|---|---|---|
| Produtores ativos | 10 | 500 | 5.000 |
| GMV mensal | R$ 50k | R$ 1M | R$ 10M |
| Taxa de conversão checkout | 60% | 70% | 75% |
| Uptime | 99.5% | 99.9% | 99.95% |
| NPS | 30 | 50 | 60 |
| Tempo de repasse | D+7 | D+3 | D+1 |
| PSPs integrados | 1 | 3 | 3+ |

---

## Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|
| Atraso na integração com PSP | Alto | Média | Payment Service desde Fase 0; sandbox early |
| Baixa conversão inicial | Alto | Média | Checkout mobile-first, testes com produtores beta |
| Chargeback elevado | Alto | Baixa | KYC rigoroso, período de retenção, monitoramento |
| Concorrente lança feature similar | Médio | Alta | Foco em conversão e UX como diferencial |
| Regulamentação BC (PIX) | Alto | Baixa | Compliance desde o MVP, consultoria jurídica |
| Limites serverless Vercel | Médio | Baixa | Usar Node runtime onde necessário, monitorar cold starts e evoluir para Vercel Pro no V2 |
| Vendor lock-in Supabase | Médio | Baixa | PostgreSQL padrão — migrations portáveis; Payment Service desacoplado |
| Falha de PSP único no MVP | Alto | Média | Payment Service pronto para segundo provider no V2 |

---

## Princípios de Priorização

1. **Receita primeiro** — features que habilitam transações têm prioridade máxima
2. **Conversão é rei** — otimizações de checkout antes de features secundárias
3. **Confiança antes de escala** — KYC, RLS, segurança e compliance não são negociáveis
4. **Dados guiam decisões** — analytics básico no MVP, avançado no V2
5. **Payment Service desde o dia 1** — abstração pronta mesmo com um PSP no MVP
6. **Server-first** — Server Actions e Server Components como padrão; client apenas quando necessário

---

*Última atualização: Julho 2026 — v2.0*

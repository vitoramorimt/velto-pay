# Velto Pay — Architecture

> Documento de arquitetura técnica. Versão 2.0 — Stack Oficial.

---

## 1. Visão Geral

A Velto Pay adota uma arquitetura **full-stack unificada** baseada em **Next.js 15**, com **Supabase** como backend-as-a-service e um **Payment Service** como camada de abstração sobre múltiplos provedores de pagamento.

A escolha prioriza **velocidade de entrega**, **simplicidade operacional** e **custo previsível** no MVP — sem sacrificar fronteiras claras entre domínios para evolução futura.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                    │
│         Browser (Desktop / Mobile) · Integrações externas (V2)          │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         VERCEL (Deploy & Edge)                          │
│             CDN · SSL · Preview deploys · Functions · Cron              │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 — Aplicação Full-Stack                    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        App Router                                │   │
│  │  (auth) · (dashboard) · (checkout) · (admin)                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────┐    ┌──────────────────────────────────┐    │
│  │   Server Actions     │    │       Route Handlers               │    │
│  │  Mutations internas  │    │  Webhooks · API pública (V2)     │    │
│  │  Forms · CRUD        │    │  Integrações externas            │    │
│  └──────────┬───────────┘    └──────────────┬───────────────────┘    │
│             │                                │                          │
│  ┌──────────▼────────────────────────────────▼───────────────────┐    │
│  │                     Domain Services Layer                       │    │
│  │  products · checkout · finance · affiliates · analytics        │    │
│  └──────────┬────────────────────────────────┬───────────────────┘    │
│             │                                │                          │
│  ┌──────────▼───────────┐    ┌─────────────▼──────────────────┐    │
│  │   Payment Service    │    │      Supabase Clients             │    │
│  │   (Abstraction)      │    │  browser · server · server-only    │    │
│  └──────────┬───────────┘    └──────────────────────────────────┘    │
└─────────────┼────────────────────────────────────────────────────────┘
              │
    ┌─────────┼──────────────┬──────────────────┬──────────────┐
    ▼         ▼              ▼                  ▼              ▼
┌────────┐ ┌────────┐  ┌───────────┐    ┌────────────┐  ┌──────────┐
│ Stripe │ │Mercado │  │ Pagar.me  │    │  Supabase  │  │  Upstash │
│        │ │  Pago  │  │           │    │            │  │  Redis   │
└────────┘ └────────┘  └───────────┘    │ · Database │  │  Cache   │
                                          │ · Auth     │  └──────────┘
                                          │ · Storage  │
                                          │ · Realtime │
                                          └────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    OBSERVABILIDADE & CI/CD                              │
│         Sentry (errors/APM) · GitHub Actions (lint/test/deploy)         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Oficial e Responsabilidades

### 2.1 Mapa de Responsabilidades

| Tecnologia | Responsabilidade na Velto Pay |
|---|---|
| **Next.js 15** | Framework full-stack: UI, roteamento, SSR/SSG, Server Actions, Route Handlers |
| **TypeScript** | Type safety end-to-end em toda a aplicação |
| **Tailwind CSS** | Estilização utility-first, design responsivo, mobile-first |
| **shadcn/ui** | Design system: componentes acessíveis, customizáveis, consistentes |
| **React Hook Form** | Formulários client-side performáticos para checkout, auth, onboarding e produto |
| **Zod** | Validação runtime em forms, Server Actions, Route Handlers e variáveis de ambiente |
| **TanStack Query** | Estado assíncrono client-side para Realtime, polling fallback e dashboards interativos |
| **Supabase — Database** | PostgreSQL gerenciado: dados de produtos, transações, finanças, afiliados |
| **Supabase — Auth** | Autenticação de produtores e admins: e-mail/senha, OAuth (V2), sessões |
| **Supabase — Storage** | Upload de imagens de produto, documentos KYC, assets do checkout |
| **Supabase — Realtime** | Atualização instantânea de status de pagamento PIX no checkout |
| **Server Actions** | Mutações server-side: CRUD, onboarding, finanças, operações autenticadas |
| **Route Handlers** | Webhooks de PSPs, endpoints públicos, API REST (V2), health checks |
| **Vercel** | Deploy, CDN, SSL, preview deploys, variáveis de ambiente, functions, cron e rollback |
| **GitHub Actions** | CI/CD: lint, typecheck, testes, validação de build e deploy automatizado para Vercel |
| **Sentry** | Monitoramento de erros, performance (APM), alertas, session replay |
| **Upstash Redis** | Cache de produtos/checkout, rate limiting, idempotency keys, sessões efêmeras |
| **Payment Service** | Abstração unificada sobre Stripe, Mercado Pago e Pagar.me |

---

### 2.2 Next.js 15 (App Router)

**Papel:** núcleo da aplicação — frontend e backend coexistem no mesmo projeto.

| Responsabilidade | Implementação |
|---|---|
| Renderização de páginas | Server Components (padrão) + Client Components (interatividade) |
| Checkout público | Route group `(checkout)` — SSR, mobile-first, SEO mínimo |
| Dashboard do produtor | Route group `(dashboard)` — layout autenticado, sidebar |
| Painel admin | Route group `(admin)` — RBAC via middleware |
| Autenticação de rotas | Middleware Next.js + Supabase Auth session |
| Mutações de dados | Server Actions próximas aos módulos em `src/modules/*/presentation` ou `src/app` quando forem específicas de rota |
| Endpoints HTTP | Route Handlers em `src/app/api/` |
| Otimização | Streaming SSR, Suspense boundaries, image optimization |

**Por que Next.js full-stack:**
- Menor superfície operacional — um deploy, um runtime
- Server Actions eliminam boilerplate de API para operações internas
- Colocation de UI e lógica de negócio por feature
- Vercel oferece suporte nativo e prioritário ao Next.js App Router

---

### 2.3 TypeScript

**Papel:** linguagem única em toda a stack.

| Responsabilidade | Implementação |
|---|---|
| Tipos de domínio | `src/types/` — Product, Transaction, CheckoutSession, etc. |
| Tipos gerados do banco | Supabase CLI gera types a partir do schema PostgreSQL |
| Validação runtime | Zod schemas compartilhados entre Server Actions, Route Handlers, forms e env validation |
| Tipos do Payment Service | Interfaces e contratos em `src/modules/payments/application` |
| Strict mode | `"strict": true` em todo o projeto |

### 2.3.1 Forms e Client State

| Tecnologia | Uso recomendado |
|---|---|
| React Hook Form | Formulários com interatividade real: checkout, login, cadastro, onboarding, produto e KYC |
| Zod | Schemas compartilhados entre forms e server; validação de env vars em adapters server-side |
| TanStack Query | Polling fallback de pagamento, dados de dashboard com refresh controlado e operações client-side que precisam cache/invalidations |

Server Components continuam sendo o padrão. TanStack Query não deve substituir fetch server-side simples.

---

### 2.4 Tailwind CSS + shadcn/ui

**Papel:** camada visual e design system.

| Tecnologia | Responsabilidade |
|---|---|
| **Tailwind CSS** | Layout, spacing, responsividade, dark mode (V2), animações |
| **shadcn/ui** | Componentes base: Button, Input, Dialog, Table, Form, Toast, etc. |
| **Componentes Velto** | Composição de shadcn/ui em `src/components/` — CheckoutForm, ProductCard, BalanceWidget |
| **Tokens de design** | Cores da marca, tipografia, radius — configurados em `tailwind.config.ts` |

**Regras:**
- shadcn/ui como base — nunca reinventar componentes primitivos
- Componentes de negócio compõem shadcn/ui, não os substituem
- Mobile-first em todas as telas de checkout

---

### 2.5 Supabase

**Papel:** backend-as-a-service — substitui banco gerenciado, auth customizado, S3 e WebSockets.

#### Database (PostgreSQL)

| Responsabilidade | Detalhe |
|---|---|
| Dados persistentes | Produtos, transações, saldos, afiliados, KYC, auditoria |
| Migrations | SQL versionado em `supabase/migrations/` via Supabase CLI |
| Row Level Security (RLS) | Produtor acessa apenas seus dados; operações privilegiadas passam por adapters server-only |
| Functions & Triggers | Cálculo de saldo, auditoria automática, validações de negócio |
| Indexes | Queries de extrato, analytics e checkout otimizadas |
| Backups | Automáticos via Supabase (daily, point-in-time recovery no Pro) |

#### Auth

| Responsabilidade | Detalhe |
|---|---|
| Cadastro/login | E-mail + senha via Supabase Auth |
| Verificação de e-mail | Flow nativo Supabase |
| Recuperação de senha | Flow nativo Supabase |
| OAuth (V2) | Google via Supabase Auth providers |
| Sessões | JWT gerenciado pelo Supabase, refresh automático |
| Roles | Custom claims via `app_metadata` (producer, affiliate, admin, support) |
| Middleware | `@supabase/ssr` para refresh de sessão no Next.js middleware |

#### Storage

| Responsabilidade | Detalhe |
|---|---|
| Imagens de produto | Bucket `product-images` — público, CDN via Supabase |
| Documentos KYC | Bucket `kyc-documents` — privado, acesso via signed URLs |
| Assets de checkout | Bucket `checkout-assets` — logos customizados (V2) |
| Políticas | RLS no Storage — produtor uploada apenas em sua pasta (`/{user_id}/`) |

#### Realtime

| Responsabilidade | Detalhe |
|---|---|
| Confirmação PIX | Subscribe em `transactions` filtrado por `checkout_session_id` |
| Notificações in-app (V2) | Subscribe em `notifications` por `user_id` |
| Dashboard live (V2) | Subscribe em vendas recentes por `producer_id` |
| Fallback | Polling via Route Handler se Realtime indisponível |

---

### 2.6 Server Actions

**Papel:** mutações server-side type-safe para operações autenticadas internas.

| Responsabilidade | Exemplo |
|---|---|
| CRUD de produtos | `createProduct`, `updateProduct`, `toggleProductStatus` |
| Onboarding | `completeOnboarding`, `submitKycDocuments` |
| Finanças | `requestPayout`, `getBalance` |
| Checkout (público) | `initiateCheckout`, `submitPayment` |
| Admin | `approveKyc`, `rejectKyc`, `suspendProducer` |
| Validação | Zod schema na entrada de cada action |
| Revalidação | `revalidatePath()` / `revalidateTag()` após mutações |
| Auth check | Verificação de sessão Supabase no início de cada action |

**Quando usar Server Actions vs Route Handlers:**

| Server Actions | Route Handlers |
|---|---|
| Forms e mutações do dashboard | Webhooks de PSPs (Stripe, MP, Pagar.me) |
| Operações autenticadas internas | Endpoints públicos consumidos externamente |
| Revalidação de cache Next.js | API REST pública (V2) |
| Upload via Server Action + Supabase Storage | Health checks, cron jobs (V2) |

---

### 2.7 Route Handlers

**Papel:** endpoints HTTP para integrações externas e webhooks.

| Rota | Responsabilidade |
|---|---|
| `POST /api/webhooks/stripe` | Recebe e processa webhooks Stripe |
| `POST /api/webhooks/mercadopago` | Recebe e processa webhooks Mercado Pago |
| `POST /api/webhooks/pagarme` | Recebe e processa webhooks Pagar.me |
| `GET /api/health` | Health check para monitoramento |
| `POST /api/v1/*` (V2) | API REST pública para integrações |
| `POST /api/cron/*` (V2) | Jobs agendados via Vercel Cron Jobs |

**Regras:**
- Webhooks executam em Node runtime, com raw body preservado para validação de assinatura
- Validação de assinatura (HMAC ou mecanismo nativo do PSP) antes de qualquer parse/processamento
- Idempotência via Upstash Redis antes de processar webhook
- Resposta 200 imediata + processamento assíncrono quando possível
- Logs estruturados + Sentry em caso de falha

---

### 2.8 Payment Service

**Papel:** camada de abstração que unifica Stripe, Mercado Pago e Pagar.me atrás de uma interface comum.

```
┌─────────────────────────────────────────────────────────┐
│                   Payment Service                        │
│                                                         │
│  Interface: PaymentProvider                             │
│  ├── createPixPayment(params) → PixPaymentResult        │
│  ├── createCardPayment(params) → CardPaymentResult      │
│  ├── getPaymentStatus(externalId) → PaymentStatus       │
│  ├── refundPayment(params) → RefundResult               │
│  ├── parseWebhook(headers, body) → WebhookEvent         │
│  └── getProviderName() → 'stripe' | 'mercadopago' | ... │
│                                                         │
│  Implementações:                                        │
│  ├── StripeProvider                                     │
│  ├── MercadoPagoProvider                                │
│  └── PagarmeProvider                                    │
│                                                         │
│  Orquestrador: PaymentService                           │
│  ├── Seleciona provider por config/regra/fallback       │
│  ├── Normaliza respostas para modelo interno            │
│  ├── Registra provider usado em cada transação        │
│  └── Circuit breaker por provider (Upstash Redis)       │
└─────────────────────────────────────────────────────────┘
```

| Responsabilidade | Detalhe |
|---|---|
| Abstração de PSPs | Interface única — lógica de negócio não conhece PSP específico |
| Seleção de provider | Por produtor, método de pagamento, regra de roteamento ou fallback |
| Normalização | Todos os providers retornam o mesmo `PaymentResult` interno |
| Webhooks unificados | Cada Route Handler delega parsing ao provider correto via Payment Service |
| Idempotência | Keys armazenadas no Upstash Redis |
| Split de pagamento | Orquestrado internamente; delegação ao provider quando suportado |
| Extensibilidade | Novo PSP = nova implementação de `PaymentProvider`, sem alterar domínio |

**MVP:** iniciar com **contrato multi-provider**, mas apenas **um provider real primário** (Mercado Pago ou Pagar.me para PIX BR e cartão). Outros providers podem existir como contratos/test doubles ou adapters vazios, mas não entram em produção até V2/V3. A abstração existe desde o início para adicionar providers sem refactor no domínio.

---

### 2.9 Upstash Redis

**Papel:** cache serverless e controle de concorrência.

| Responsabilidade | Detalhe |
|---|---|
| Cache de produtos | Dados de checkout público — TTL 5 min, invalidação em update |
| Cache de configuração | Taxas, settings de checkout — TTL 15 min |
| Rate limiting | Por IP (checkout público), por user (dashboard), por API key (V2) |
| Idempotency keys | Pagamentos e webhooks — TTL 24h |
| Circuit breaker | Estado de saúde por PSP — TTL 5 min |
| Sessões efêmeras | Dados temporários de checkout (affiliate cookie, A/B variant) |
| Contadores | Analytics em tempo real (pageviews de checkout) — V2 |

**Por que Upstash (e não Redis self-hosted):**
- Serverless — paga por request, zero custo idle no MVP
- REST API — funciona nativamente em Vercel Functions e ambientes serverless
- Compatível com `@upstash/ratelimit` e `@upstash/redis`

---

### 2.10 Vercel

**Papel:** plataforma de deploy e hospedagem.

| Responsabilidade | Detalhe |
|---|---|
| Deploy automático | PR → preview deploy; release aprovada → produção |
| CDN global | Assets estáticos, páginas SSG, edge caching |
| SSL/TLS | Certificados automáticos, HTTPS enforced |
| Variáveis de ambiente | Secrets por contexto (production, deploy-preview, branch) |
| Rollback | Instant rollback para deploy anterior |
| Domínio customizado | `velto.pay` produção; `*.velto.pay` subdomínios checkout (V2) |
| Vercel Functions | Route Handlers Next.js executados como serverless functions |
| Node runtime | Webhooks de PSP, assinatura com raw body, SDKs de pagamento e crypto |
| Edge runtime | Apenas leituras públicas/cache quando não houver dependência Node |
| Vercel Cron Jobs (V2) | Reconciliação, e-mails de recuperação, fechamento financeiro |

---

### 2.11 GitHub Actions

**Papel:** pipeline de CI/CD.

| Job | Trigger | Ações |
|---|---|---|
| **CI — Pull Request** | PR para `main` ou `develop` | Lint, typecheck, testes unitários, testes de integração |
| **CI — Build** | PR + push | Build Next.js, verificar que compila |
| **CD — Staging** | PR ou push em `develop` | Deploy preview Vercel (staging) |
| **CD — Production** | Release aprovada para `main` | Deploy produção Vercel |
| **Migrations** | Push em `main` (manual gate) | `supabase db push` via Supabase CLI |
| **Security** | Semanal | Dependabot, audit de vulnerabilidades |

---

### 2.12 Sentry

**Papel:** observabilidade e monitoramento de erros.

| Responsabilidade | Detalhe |
|---|---|
| Error tracking | Exceções em Server Actions, Route Handlers e Client Components |
| Performance (APM) | Tempo de resposta de Server Actions e Route Handlers |
| Session replay (V2) | Reprodução de erros no checkout |
| Alertas | Slack/e-mail para erros críticos (pagamentos, webhooks) |
| Release tracking | Correlacionar erros com deploys Vercel |
| Breadcrumbs | Contexto de fluxo de pagamento para debug |

---

## 3. Estrutura de Pastas

```
velto-pay/
├── src/
│   ├── app/
│   │   ├── (auth)/                       # Rotas públicas de autenticação
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/                  # Painel do produtor (autenticado)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Overview / analytics
│   │   │   ├── products/
│   │   │   ├── sales/
│   │   │   ├── finance/
│   │   │   ├── affiliates/               # V2
│   │   │   └── settings/
│   │   ├── (checkout)/                   # Checkout público
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       ├── success/
│   │   │       └── expired/
│   │   ├── (admin)/                      # Painel interno
│   │   │   ├── kyc/
│   │   │   └── transactions/
│   │   ├── api/                          # Route Handlers
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/route.ts
│   │   │   │   ├── mercadopago/route.ts
│   │   │   │   └── pagarme/route.ts
│   │   │   ├── health/route.ts
│   │   │   └── v1/                       # API pública (V2)
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   └── layout/                       # Shells, navigation, shared layout
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── products/
│   │   ├── checkout/
│   │   ├── payments/
│   │   ├── finance/
│   │   ├── notifications/
│   │   └── admin/
│   │       ├── domain/
│   │       ├── application/
│   │       ├── infrastructure/
│   │       └── presentation/
│   │
│   ├── shared/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser client (anon key)
│   │   │   ├── server.ts                 # Server Component / Server Action client
│   │   │   ├── middleware.ts             # Middleware session refresh
│   │   │   └── server-only-admin.ts      # Service role adapter, importável apenas server-side
│   │   ├── redis/
│   │   │   ├── client.ts                 # Upstash Redis client
│   │   │   ├── cache.ts                  # Cache helpers
│   │   │   └── rate-limit.ts             # Rate limiting
│   │   ├── config/                       # Zod env validation
│   │   ├── errors/
│   │   ├── logger/                       # Structured logs + masking
│   │   ├── utils/
│   │   └── database.types.ts             # Gerado pelo Supabase CLI
│   │
│   └── middleware.ts                     # Auth middleware, rate limiting
│
├── supabase/
│   ├── migrations/                       # SQL migrations versionadas
│   ├── seed.sql                          # Dados de desenvolvimento
│   └── config.toml                       # Config local Supabase
│
├── docs/
│   └── decisions/                        # ADRs
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── public/                               # Assets estáticos
├── PROJECT.md
├── PRD.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── CONTRIBUTING.md
├── vercel.json                           # Config Vercel quando necessario
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Módulos do Sistema

Cada módulo é implementado como conjunto de **Server Actions + queries Supabase + componentes** — não como microserviço separado.

O código deve seguir Clean Architecture em escala pragmática:

```
src/modules/<module>/
├── domain/          # entidades, value objects, regras puras e erros de domínio
├── application/     # use cases, commands, queries e portas/interfaces
├── infrastructure/  # adapters Supabase, PSP, Redis, e-mail e storage
└── presentation/    # componentes, forms e view models específicos do módulo
```

`src/app` é camada de entrega. Server Actions e Route Handlers devem chamar use cases; regra financeira, validação de domínio e orquestração de pagamento não devem ficar diretamente em arquivos de rota.

### 4.1 Auth Module → Supabase Auth + Middleware

```
Responsabilidades:
├── Cadastro e login (Supabase Auth)
├── Verificação de e-mail (Supabase Auth)
├── Recuperação de senha (Supabase Auth)
├── Refresh de sessão (middleware @supabase/ssr)
├── RBAC via app_metadata.role
└── Rate limiting em endpoints de auth (Upstash)
```

### 4.2 Users Module → Server Actions + Supabase DB/Storage

```
Responsabilidades:
├── Perfil do produtor (tabela profiles)
├── KYC — upload via Supabase Storage, status via DB
├── Dados bancários para saque
├── Configurações de conta
└── Gestão de equipe (V2)
```

### 4.3 Products Module → Server Actions + Supabase DB/Storage

```
Responsabilidades:
├── CRUD via Server Actions
├── Upload de imagem via Supabase Storage
├── Geração de slug/link de checkout
├── Cache de produto no Upstash Redis
└── Order bump, upsell, cupons (V2)
```

### 4.4 Checkout Module → Server Components + Server Actions + Realtime

```
Responsabilidades:
├── Página pública SSR/SSG
├── Coleta de dados do comprador
├── Iniciação de pagamento via Payment Service
├── Subscribe Realtime para confirmação PIX
├── Tracking de sessão (funil)
└── Customização visual, A/B testing (V2)
```

### 4.5 Payments Module → Payment Service + Route Handlers

```
Responsabilidades:
├── Orquestração via PaymentService
├── Route Handlers para webhooks de cada PSP
├── Idempotência via Upstash Redis
├── Persistência append-only em payment_events
├── Emissão de outbox_events para efeitos assíncronos
├── Registro em Supabase (transactions)
├── Split de pagamento
└── Retentativa, assinaturas (V2)
```

### 4.6 Finance Module → Server Actions + Supabase DB

```
Responsabilidades:
├── Ledger financeiro append-only como fonte auditável
├── Cálculo de saldo (disponível vs. pendente) derivado do ledger
├── Período de retenção (escrow) via ledger + jobs de liberação
├── Saques via Server Actions
├── Extrato com paginação cursor-based
└── Relatórios, antecipação (V2/V3)
```

### 4.7 Affiliates Module (V2)

```
Responsabilidades:
├── Programa por produto
├── Links exclusivos + cookie tracking (Upstash)
├── Cálculo de comissões
└── Dashboard do afiliado
```

### 4.8 Analytics Module → Supabase DB + Server Components

```
Responsabilidades:
├── Agregações via SQL/Supabase RPC
├── Dashboard com Server Components
├── Cache de métricas no Upstash Redis
└── Funil, A/B results, exportação (V2)
```

### 4.9 Notifications Module → Server Actions + Route Handlers

```
Responsabilidades:
├── E-mails transacionais (Resend via Server Action)
├── Realtime in-app (V2)
├── Webhooks outbound (V2)
└── WhatsApp (V2)
```

### 4.10 Admin Module → Server Actions + server-only adapters

```
Responsabilidades:
├── Admin mínimo no MVP para aprovar/rejeitar KYC e produtores
├── Visão global de transações
├── Gestão de produtores
├── Logs de auditoria (tabela audit_logs)
└── Feature flags (V2)
```

---

## 5. Fluxo de Autenticação

### 5.1 Cadastro e Login (Supabase Auth)

```
┌──────────┐   Server Action: signUp()    ┌──────────────┐
│  Browser │ ──────────────────────────▶ │   Next.js    │
│          │                              │ Server Action│
│          │                              └──────┬───────┘
│          │                                     │
│          │                              ┌──────▼───────┐
│          │                              │ Supabase Auth│
│          │                              │ · create user│
│          │◀── redirect + session cookie─│ · send verify│
└──────────┘                              └──────────────┘
```

### 5.2 Sessão e Middleware

```
Request → middleware.ts
            │
            ├── Refresh session (@supabase/ssr)
            ├── Check route protection
            │     ├── (dashboard) → require auth + role:producer
            │     ├── (admin) → require auth + role:admin
            │     └── (checkout) → public
            └── Pass to route
```

### 5.3 Estratégia de Sessão

| Aspecto | Implementação |
|---|---|
| Provider | Supabase Auth |
| Token | JWT (access + refresh) |
| Armazenamento | httpOnly cookies via `@supabase/ssr` |
| Refresh | Automático no middleware a cada request |
| Duração | Configurável no Supabase Dashboard (default: 1h access, 7d refresh) |
| Roles | `app_metadata.role` — producer, affiliate, admin, support |

### 5.4 Autorização (RBAC)

```typescript
// Server Action — verificação de role
export async function createProduct(formData: FormData) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata.role !== 'producer') {
    throw new UnauthorizedError();
  }
  // ...
}
```

Row Level Security (RLS) no Supabase garante isolamento de dados mesmo se a aplicação falhar:

```sql
-- Produtor vê apenas seus produtos
CREATE POLICY "Producers see own products"
  ON products FOR SELECT
  USING (auth.uid() = producer_id);
```

### 5.5 Checkout Público

O checkout **não requer autenticação** do comprador:

- Sessão identificada por `checkout_session_id` (UUID)
- Rate limiting por IP via Upstash Redis
- Dados do comprador coletados no formulário
- Realtime subscribe por `checkout_session_id` para status PIX

---

## 6. Fluxo de Pagamento (PIX)

```
Comprador       Next.js              Payment Service      PSP          Supabase
    │           Server Action              │                │          Realtime
    │                │                     │                │              │
    │── acessa ─────▶│                     │                │              │
    │   /checkout/x  │── get product ──────┼────────────────┼─────────────▶│
    │                │◀── product data ────┼────────────────┼──────────────│
    │── submit ─────▶│                     │                │              │
    │                │── createPixPayment ─▶│                │              │
    │                │                     │── create ─────▶│              │
    │                │                     │◀── qr + tx_id ─│              │
    │                │── save transaction ─┼────────────────┼─────────────▶│
    │◀── QR code ────│                     │                │              │
    │                │                     │                │              │
    │  (paga PIX)    │                     │                │              │
    │                │                     │                │              │
    │                │  Route Handler      │                │              │
    │                │◀── webhook PIX ─────┼────────────────│              │
    │                │── parseWebhook ────▶│                │              │
    │                │── save event ───────┼────────────────┼─────────────▶│
    │                │── update tx paid ───┼────────────────┼─────────────▶│
    │                │── append ledger ────┼────────────────┼─────────────▶│
    │                │── enqueue outbox ───┼────────────────┼─────────────▶│
    │◀── Realtime ───┼─────────────────────┼────────────────┼──────────────│
    │   status:paid  │                     │                │              │
    │                │── send emails ──────│                │              │
```

**Confirmação em tempo real:** Supabase Realtime notifica o checkout quando `transactions.status` muda para `paid`. Realtime melhora UX, mas a fonte de verdade é o estado persistido no banco; o checkout deve ter fallback de polling.

**Efeitos colaterais:** e-mails, reconciliação, notificações e integrações externas não devem bloquear o webhook. O webhook persiste `payment_events`, atualiza a transação, grava o ledger e cria `outbox_events` para processamento assíncrono.

---

## 7. Modelo de Dados

```
auth.users (Supabase Auth)
    │
    ▼
profiles ────────────── products ────────── checkout_sessions
    │                      │                      │
    │                      │                      ▼
    ├──── kyc_documents    │               transactions
    │                      │                      │
    ├──── bank_accounts    │                      │
    │                      ▼                      │
    ├──── balances ◀──────┐               payment_events
    │   (derived cache)   │                      │
    │                     ▼                      ▼
    ├──── ledger_entries ◀────────────── outbox_events
    │
    ├──── payouts
    │
    ├──── affiliate_links (V2)
    │
    └──── audit_logs
```

`ledger_entries`, `payment_events` e `outbox_events` são append-only no fluxo normal. Correções financeiras devem ser feitas por lançamentos compensatórios, nunca por edição destrutiva de eventos históricos.

Todas as tabelas de negócio possuem RLS habilitado. Operações de webhook e rotinas administrativas sensíveis usam `service_role` somente através de adapters server-only, nunca em componentes React, Client Components, middleware público ou módulos compartilhados com o browser.

---

## 8. Padrões de Código

### 8.1 Princípios

- **Colocation by feature** — actions, components e types próximos ao domínio
- **Server-first** — Server Components e Server Actions como padrão
- **Type-safe** — Zod na entrada, Supabase types na persistência
- **Fail fast** — validação na borda, erros tipados
- **Provider pattern** — Payment Service isola integrações externas

### 8.2 Server Actions

```
src/modules/<module>/presentation/actions.ts
├── products/actions.ts       # createProduct, updateProduct, deleteProduct
├── checkout/actions.ts       # initiateCheckout, submitPayment
├── finance/actions.ts        # requestPayout, getStatement
└── admin/actions.ts          # approveKyc, rejectKyc
```

**Regras:**
- Uma action por operação de negócio
- Validação Zod no início
- Auth check via Supabase session
- Retorno tipado (success/error discriminated union)
- `revalidatePath()` após mutações que afetam UI

### 8.3 Route Handlers

```
src/app/api/
├── webhooks/
│   ├── stripe/route.ts       # POST — valida signature, delega ao PaymentService
│   ├── mercadopago/route.ts
│   └── pagarme/route.ts
└── health/route.ts           # GET — status check
```

**Regras:**
- Webhooks de PSP devem declarar Node runtime
- Raw body deve ser preservado para validação de assinatura
- Validação de assinatura antes de qualquer parse/processamento
- Idempotency check via Upstash Redis e constraint única no PostgreSQL
- Persistir `payment_events` antes de aplicar transições de estado
- Criar `outbox_events` para efeitos assíncronos
- Resposta 200 rápida; processamento pesado via Server Action ou background
- Sentry capture em exceções

### 8.4 Componentes

```
src/components/
├── ui/               # shadcn/ui — não editar diretamente, usar CLI
├── checkout/         # Componentes específicos do checkout
├── dashboard/        # Componentes do painel
└── shared/           # Componentes reutilizáveis
```

**Regras:**
- Server Components por padrão
- `'use client'` apenas para interatividade (forms, Realtime subscribe)
- Props tipadas, sem `any`
- Composição sobre herança

---

## 9. Convenções de Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Arquivos/diretórios | kebab-case | `payment-service.ts`, `use-checkout-session.ts` |
| Server Actions | camelCase, verbo | `createProduct`, `requestPayout` |
| Route Handlers | kebab-case path | `/api/webhooks/mercadopago` |
| Classes/Types | PascalCase | `PaymentService`, `CheckoutSession` |
| Variáveis/funções | camelCase | `getPaymentStatus()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Enums | PascalCase + UPPER_SNAKE values | `PaymentStatus.PAID` |
| Banco de dados | snake_case | `checkout_sessions`, `created_at` |
| Supabase buckets | kebab-case | `product-images`, `kyc-documents` |
| Env vars | UPPER_SNAKE_CASE | `SUPABASE_SERVICE_ROLE_KEY` |
| Componentes React | PascalCase | `CheckoutForm`, `PixDisplay` |
| Hooks | `use` + PascalCase | `useRealtimePayment()` |
| Testes | `.test.ts` / `.spec.ts` | `payment-service.test.ts` |

---

## 10. Segurança

### 10.1 Autenticação e Autorização

- Supabase Auth com JWT + refresh automático via middleware
- RBAC via `app_metadata.role` + RLS em todas as tabelas
- Service role key **apenas** em adapters server-only usados por webhooks, cron jobs e operações administrativas sensíveis
- Rate limiting via Upstash: 20 req/min (auth), 100 req/min (autenticado), 30 req/min (checkout público)
- Variáveis de ambiente validadas com Zod em código server-side antes de inicializar adapters
- Cookies de sessão com `httpOnly`, `secure` e `sameSite` adequados ao fluxo

### 10.2 Dados Sensíveis

- CPF/CNPJ: coluna criptografada no PostgreSQL (pgcrypto)
- Dados bancários: apenas últimos 4 dígitos armazenados; restante tokenizado
- Dados de cartão **nunca** passam pela Velto — tokenização via PSP
- KYC documents: Supabase Storage privado, acesso via signed URLs com TTL

### 10.3 Comunicação

- TLS 1.3 (Vercel enforced)
- HSTS habilitado
- CSP configurado no `next.config.ts`
- Webhook signature verification (HMAC) em todos os PSPs

### 10.4 Supabase RLS

- **Toda tabela** de negócio com RLS habilitado
- Produtor: CRUD apenas em seus registros (`auth.uid() = producer_id`)
- Admin: Server Actions com role check chamam use cases; use cases chamam adapters server-only quando service role for inevitável
- Checkout público: insert-only em `checkout_sessions` e `transactions` via Server Action

### 10.5 LGPD

- Consentimento no cadastro (checkbox + registro de timestamp)
- Exportação de dados via Server Action
- Exclusão: soft delete + anonimização via Supabase Auth admin API
- Retenção documentada; KYC documents deletados após 5 anos

### 10.6 Auditoria

- Tabela `audit_logs` com trigger em operações financeiras e admin
- Sentry para erros; structured logs em Route Handlers críticos
- Logs devem mascarar CPF/CNPJ, e-mail, telefone, IP quando necessário, tokens, secrets, payloads de PSP e identificadores financeiros sensíveis
- Retenção: 2 anos

---

## 11. Escalabilidade

### 11.1 Estratégia por Fase

| Fase | Arquitetura | Capacidade estimada |
|---|---|---|
| MVP | Next.js serverless (Vercel) + Supabase Free/Pro + Upstash Free | ~500 TPS checkout, 1k produtores |
| V2 | Vercel Pro + Supabase Pro + Upstash Pro + cache agressivo | ~2k TPS, 10k produtores |
| V3 | Vercel Enterprise + Supabase Team + read replicas + edge | ~5k TPS, 100k produtores |

### 11.2 Pontos de Escala

```
Next.js (Vercel) ───── Auto-scaling serverless functions
                       Edge caching para checkout estático
                       ISR para páginas de produto

Supabase DB ────────── Connection pooling (Supavisor)
                       Indexes compostos em queries frequentes
                       Read replicas (V2, Supabase Pro)
                       RPC functions para agregações pesadas

Upstash Redis ──────── Cache-aside para produtos e config
                       Rate limiting distribuído
                       Idempotency store

Supabase Realtime ──── Subscribe filtrado (por session/user)
                       Fallback polling se Realtime down

Payment Service ────── Circuit breaker por provider (Upstash)
                       Fallback provider automático
                       Retry com exponential backoff
```

### 11.3 Estratégias

- **Cache-aside** (Upstash) — produtos, config de checkout, taxas
- **Event-driven** — webhook → `payment_events` → update DB/ledger → Realtime notify → `outbox_events`
- **Idempotência** — Upstash Redis para pagamentos e webhooks
- **Circuit breaker** — Payment Service monitora saúde de cada PSP
- **Cursor-based pagination** — extrato e listagens
- **Database indexes** — `(producer_id, created_at)`, `(checkout_session_id)`, `(status)`

### 11.4 Disaster Recovery

- Backups automáticos Supabase (daily; PITR no Pro)
- Rollback instantâneo via Vercel (deploy anterior)
- Runbook documentado para falha de PSP (fallback provider)
- Testes de recovery trimestrais

---

## 12. Decisões de Arquitetura (ADRs)

| ADR | Decisão | Status | Substitui |
|---|---|---|---|
| ADR-001 | Next.js 15 full-stack (App Router) | Aceito | Arquitetura multi-deploy |
| ADR-002 | Supabase como BaaS (DB, Auth, Storage, Realtime) | Aceito | ADR-003, ADR-004, ADR-006 |
| ADR-003 | Server Actions para mutações internas | Aceito | — |
| ADR-004 | Route Handlers para webhooks e API externa | Aceito | — |
| ADR-005 | Vercel para deploy e hosting | Aceito | AWS/ECS |
| ADR-006 | Upstash Redis para cache e rate limiting | Aceito | ADR-007 (BullMQ) |
| ADR-007 | Payment Service como abstração multi-PSP | Aceito | ADR-008 |
| ADR-008 | Sentry para observabilidade | Aceito | — |
| ADR-009 | GitHub Actions para CI/CD | Aceito | — |
| ADR-010 | shadcn/ui + Tailwind como design system | Aceito | — |

ADRs detalhados em `docs/decisions/`.

---

*Última atualização: Julho 2026 — v2.0 Stack Oficial*

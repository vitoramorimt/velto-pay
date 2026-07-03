# Velto Pay — Project Overview

> Plataforma de checkout inteligente para produtores digitais.

---

## Visão do Produto

Ser a plataforma de pagamentos e checkout de referência para produtores digitais na América Latina — unindo **conversão**, **simplicidade** e **inteligência de dados** em uma experiência que coloca o produtor no controle do seu negócio.

A Velto Pay nasce da convicção de que o checkout é o momento mais crítico da jornada de compra. Cada segundo de atrito, cada campo desnecessário e cada falha de pagamento representa receita perdida. Nossa plataforma transforma o checkout de um gargalo operacional em um **motor de crescimento**.

---

## Missão

**Empoderar produtores digitais a vender mais, com menos fricção e mais controle.**

Entregamos infraestrutura de pagamentos moderna, checkout otimizado para conversão e ferramentas analíticas que permitem decisões baseadas em dados — sem exigir conhecimento técnico avançado.

---

## Valores

| Valor | Descrição |
|---|---|
| **Velocidade** | Checkout rápido, onboarding ágil, time-to-revenue mínimo |
| **Confiança** | Segurança, transparência e conformidade em primeiro lugar |
| **Inteligência** | Decisões orientadas por dados, não por intuição |
| **Simplicidade** | Complexidade técnica absorvida pela plataforma, não pelo produtor |
| **Parceria** | O sucesso do produtor é o nosso sucesso |

---

## Público-Alvo

### Persona Primária — Produtor Digital

- Criadores de cursos online, e-books, mentorias e comunidades pagas
- Infoprodutores com faturamento entre R$ 10k e R$ 500k/mês
- Equipes pequenas (1–5 pessoas) que precisam de autonomia operacional
- Buscam alternativas a plataformas genéricas com taxas altas e checkout limitado

### Persona Secundária — Afiliado

- Parceiros que promovem produtos de terceiros
- Precisam de rastreamento confiável, comissões transparentes e pagamentos recorrentes

### Persona Terciária — Comprador Final

- Consumidor que chega ao checkout via link, landing page ou upsell
- Espera pagamento rápido, seguro e sem surpresas (PIX, cartão, parcelamento)

### Persona Interna — Operador Velto

- Equipe de suporte, compliance e operações financeiras
- Precisa de visibilidade sobre transações, disputas e saúde da plataforma

---

## Problema que Resolvemos

Produtores digitais enfrentam hoje:

1. **Checkouts genéricos** — templates rígidos, baixa conversão, experiência mobile deficiente
2. **Fragmentação de ferramentas** — gateway, checkout, afiliados, recuperação de carrinho e analytics em sistemas separados
3. **Taxas opacas** — custos escondidos, repasses demorados, falta de previsibilidade
4. **Recuperação de vendas inexistente** — carrinhos abandonados e pagamentos recusados sem ação automatizada
5. **Falta de inteligência** — dados de conversão dispersos, sem insights acionáveis

---

## Proposta de Valor

```
Produtor configura produto → Gera link de checkout → Comprador paga em segundos
                                                              ↓
                                              Velto processa, confirma e repassa
                                                              ↓
                                              Dashboard com métricas em tempo real
```

---

## Diferenciais Competitivos

| Diferencial | Descrição |
|---|---|
| **Checkout Inteligente** | Layout adaptativo, order bump, upsell one-click e recuperação automática de carrinho |
| **Conversão como métrica central** | A/B testing nativo, funil de checkout e heatmap de abandono |
| **PIX nativo e instantâneo** | Confirmação em tempo real via Supabase Realtime — sem polling, sem refresh |
| **Payment Service multi-provider** | Contrato comum para Stripe, Mercado Pago e Pagar.me; MVP com apenas um PSP real implementado inicialmente |
| **Afiliados integrados** | Programa de afiliados nativo, sem ferramentas externas |
| **Onboarding em minutos** | Do cadastro ao primeiro link de checkout em menos de 10 minutos |
| **API-first** | Integração com landing pages, CRMs e automações via Route Handlers (V2) |
| **Transparência financeira** | Taxas claras, extrato detalhado e previsão de repasse |

---

## Escopo do Produto (Macro)

A Velto Pay é composta por quatro pilares:

1. **Checkout** — Página pública de pagamento otimizada para conversão
2. **Dashboard do Produtor** — Gestão de produtos, vendas, afiliados e finanças
3. **Payment Service** — Abstração multi-provider para PIX e cartão, com um PSP real no MVP e novos providers adicionados sem refatorar o domínio
4. **Plataforma de Dados** — Analytics, relatórios e inteligência de conversão

---

## Stack Tecnológica

| Camada | Tecnologia | Papel |
|---|---|---|
| Frontend & Backend | Next.js 15 (App Router) | Aplicação full-stack unificada |
| Linguagem | TypeScript | Type safety end-to-end |
| UI | Tailwind CSS + shadcn/ui | Design system e estilização |
| Forms | React Hook Form + Zod | Formulários performáticos com validação runtime compartilhada |
| Client state | TanStack Query | Estado assíncrono client-side para Realtime, polling fallback e dashboards interativos |
| Backend-as-a-Service | Supabase | Database, Auth, Storage, Realtime |
| Mutações server-side | Server Actions | CRUD, onboarding, finanças |
| Endpoints HTTP | Route Handlers | Webhooks de PSPs, API pública (V2) |
| Pagamentos | Payment Service | Contrato multi-provider; MVP com um PSP real inicial |
| Cache | Upstash Redis | Cache, rate limiting, idempotência |
| Deploy | Vercel | Hosting, CDN, SSL, preview deploys, functions e rollback |
| CI/CD | GitHub Actions | Lint, test, build, deploy automático |
| Monitoramento | Sentry | Erros, performance, alertas |

Detalhes completos em [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Modelo de Negócio

- **Taxa por transação** — percentual sobre cada venda aprovada
- **Planos por volume** — tiers com taxas decrescentes conforme faturamento mensal
- **Add-ons** — recuperação de carrinho avançada, A/B testing ilimitado, domínio customizado

---

## Métricas de Sucesso (North Star)

| Métrica | Meta MVP | Meta 12 meses |
|---|---|---|
| Taxa de conversão média do checkout | > 65% | > 75% |
| Time-to-first-sale (novo produtor) | < 24h | < 4h |
| Uptime da plataforma | 99.5% | 99.9% |
| NPS do produtor | > 40 | > 60 |
| GMV processado | — | R$ 10M/mês |

---

## Stakeholders

| Stakeholder | Interesse |
|---|---|
| Produtor digital | Vender mais, receber rápido, controlar o negócio |
| Comprador | Pagar com segurança e rapidez |
| Afiliado | Comissões justas e rastreamento confiável |
| Velto (empresa) | Crescimento sustentável, compliance, escalabilidade |
| Adquirentes / PSPs | Volume de transações, baixo chargeback |

---

## Documentos Relacionados

| Documento | Conteúdo |
|---|---|
| [PRD.md](./PRD.md) | Requisitos funcionais, não funcionais e regras de negócio |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura técnica, stack, módulos e segurança |
| [ROADMAP.md](./ROADMAP.md) | Planejamento MVP, V2 e V3 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Padrões de código, convenções e fluxo de contribuição |

---

## Status Atual

| Item | Status |
|---|---|
| Repositório | Inicializado |
| Documentação | v2.0 — Stack oficial definida |
| Stack | Next.js 15 + Supabase + Vercel + Payment Service |
| Código | Não iniciado |
| Infraestrutura | Não provisionada (Supabase, Vercel, Upstash) |

---

*Última atualização: Julho 2026 — v2.0*

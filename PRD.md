# Velto Pay — Product Requirements Document (PRD)

> Documento de requisitos do produto. Versão 2.0 — Stack Oficial.

---

## 1. Contexto

A Velto Pay é uma plataforma de checkout e pagamentos voltada para produtores digitais. Este PRD define os requisitos funcionais, não funcionais e regras de negócio que orientam o desenvolvimento do MVP e versões subsequentes.

**Referências:** [PROJECT.md](./PROJECT.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [ROADMAP.md](./ROADMAP.md)

---

## 2. Objetivos do Produto

### Objetivo Principal
Permitir que produtores digitais criem, publiquem e monetizem produtos digitais com um checkout de alta conversão e repasse financeiro confiável.

### Objetivos Secundários
- Reduzir abandono de checkout em pelo menos 20% vs. soluções genéricas
- Automatizar confirmação de pagamentos PIX em tempo real
- Oferecer visibilidade financeira completa ao produtor
- Viabilizar programa de afiliados sem ferramentas externas

---

## 3. Personas e Jornadas

### 3.1 Produtor Digital

```
Cadastro → Verificação de identidade → Criar produto → Configurar checkout
    → Compartilhar link → Receber pagamentos → Acompanhar dashboard → Solicitar saque
```

### 3.2 Comprador

```
Acessar link → Visualizar oferta → Preencher dados → Escolher pagamento
    → Confirmar → Receber acesso/confirmação por e-mail
```

### 3.3 Afiliado

```
Receber link exclusivo → Divulgar → Comprador converte → Comissão registrada
    → Visualizar extrato → Receber pagamento
```

---

## 4. Requisitos Funcionais

### 4.1 Autenticação e Conta (AUTH)

| ID | Requisito | Prioridade | Versão |
|---|---|---|---|
| AUTH-01 | Cadastro de produtor com e-mail e senha (Supabase Auth) | Must | MVP |
| AUTH-02 | Login com e-mail/senha (Supabase Auth) | Must | MVP |
| AUTH-03 | Recuperação de senha via e-mail (Supabase Auth) | Must | MVP |
| AUTH-04 | Verificação de e-mail no cadastro (Supabase Auth) | Must | MVP |
| AUTH-05 | Autenticação via OAuth Google (Supabase Auth) | Should | V2 |
| AUTH-06 | Autenticação de dois fatores (2FA) | Should | V2 |
| AUTH-07 | Gestão de sessões ativas | Could | V2 |
| AUTH-08 | SSO para equipes | Could | V3 |

### 4.2 Onboarding e KYC (ONBOARD)

| ID | Requisito | Prioridade | Versão |
|---|---|---|---|
| ONBOARD-01 | Fluxo de onboarding guiado pós-cadastro | Must | MVP |
| ONBOARD-02 | Coleta de dados pessoais/empresariais (CPF/CNPJ) | Must | MVP |
| ONBOARD-03 | Upload de documentos KYC via Supabase Storage | Must | MVP |
| ONBOARD-04 | Status de verificação visível no dashboard | Must | MVP |
| ONBOARD-05 | Bloqueio de saques até KYC aprovado | Must | MVP |
| ONBOARD-06 | Verificação automatizada via parceiro KYC | Should | V2 |

### 4.3 Produtos (PRODUCT)

| ID | Requisito | Prioridade | Versão |
|---|---|---|---|
| PRODUCT-01 | Criar produto digital (nome, descrição, preço, imagem) | Must | MVP |
| PRODUCT-02 | Criar produto de pagamento único | Must | MVP |
| PRODUCT-03 | Configurar parcelamento no cartão (1x a 12x) | Must | MVP |
| PRODUCT-04 | Ativar/desativar produto | Must | MVP |
| PRODUCT-05 | Gerar link exclusivo de checkout por produto | Must | MVP |
| PRODUCT-06 | Order bump (oferta adicional no checkout) | Should | V2 |
| PRODUCT-07 | Upsell pós-compra (one-click) | Should | V2 |
| PRODUCT-08 | Produto com assinatura recorrente e múltiplos planos/preços | Should | V2 |
| PRODUCT-09 | Cupons de desconto (percentual ou valor fixo) | Should | V2 |
| PRODUCT-10 | Produto com acesso via área de membros integrada | Could | V3 |

### 4.4 Checkout (CHECKOUT)

| ID | Requisito | Prioridade | Versão |
|---|---|---|---|
| CHECKOUT-01 | Página pública de checkout responsiva (mobile-first) | Must | MVP |
| CHECKOUT-02 | Coleta de nome, e-mail e CPF do comprador | Must | MVP |
| CHECKOUT-03 | Pagamento via PIX com QR Code e copia-e-cola | Must | MVP |
| CHECKOUT-04 | Pagamento via cartão de crédito | Must | MVP |
| CHECKOUT-05 | Confirmação de pagamento PIX em tempo real (Supabase Realtime) | Must | MVP |
| CHECKOUT-06 | Página de sucesso pós-pagamento | Must | MVP |
| CHECKOUT-07 | Página de erro/recusa com opção de retry | Must | MVP |
| CHECKOUT-08 | Countdown de expiração do PIX (15 min) | Must | MVP |
| CHECKOUT-09 | Customização visual básica (logo, cores) | Should | V2 |
| CHECKOUT-10 | Checkout em domínio customizado (CNAME) | Should | V2 |
| CHECKOUT-11 | A/B testing de layout de checkout | Could | V2 |
| CHECKOUT-12 | Recuperação de carrinho abandonado via e-mail | Should | V2 |
| CHECKOUT-13 | Pagamento via boleto bancário | Could | V2 |
| CHECKOUT-14 | Checkout internacional (multi-moeda) | Could | V3 |

### 4.5 Pagamentos (PAYMENT)

| ID | Requisito | Prioridade | Versão |
|---|---|---|---|
| PAYMENT-01 | Processar transação PIX end-to-end via Payment Service | Must | MVP |
| PAYMENT-02 | Processar transação cartão de crédito end-to-end via Payment Service | Must | MVP |
| PAYMENT-03 | Webhook de confirmação via Route Handlers (por PSP) | Must | MVP |
| PAYMENT-04 | Idempotência em processamento (Upstash Redis) | Must | MVP |
| PAYMENT-05 | Registro de status: pending, paid, failed, refunded, chargeback | Must | MVP |
| PAYMENT-06 | Estorno (refund) total e parcial via Payment Service | Should | V2 |
| PAYMENT-07 | Gestão de chargeback e disputas | Should | V2 |
| PAYMENT-08 | Split de pagamento entre plataforma e produtor, com reserva de modelo para afiliado no V2 | Must | MVP |
| PAYMENT-09 | Retentativa automática de cartão recusado | Could | V2 |
| PAYMENT-10 | Assinaturas recorrentes com cobrança automática | Should | V2 |
| PAYMENT-11 | Payment Service multi-provider com um PSP real implementado inicialmente | Must | MVP |
| PAYMENT-12 | Seleção/fallback de provider por regra de roteamento | Should | V2 |
| PAYMENT-13 | Circuit breaker por provider (Upstash Redis) | Should | V2 |
| PAYMENT-14 | Persistir `payment_events` append-only para todo evento recebido de PSP | Must | MVP |
| PAYMENT-15 | Publicar efeitos assíncronos via `outbox_events` após mudanças financeiras críticas | Must | MVP |

### 4.6 Finanças e Repasse (FINANCE)

| ID | Requisito | Prioridade | Versão |
|---|---|---|---|
| FINANCE-01 | Saldo disponível e saldo pendente no dashboard | Must | MVP |
| FINANCE-02 | Extrato de transações com filtros (data, status, produto) | Must | MVP |
| FINANCE-03 | Solicitação de saque para conta bancária cadastrada | Must | MVP |
| FINANCE-04 | Período de retenção configurável (D+7, D+14, D+30) | Must | MVP |
| FINANCE-05 | Taxa da plataforma descontada automaticamente | Must | MVP |
| FINANCE-06 | Ledger financeiro append-only para vendas, taxas, retenção, liberação, saque, estorno e chargeback | Must | MVP |
| FINANCE-07 | Relatório de faturamento mensal exportável (CSV/PDF) | Should | V2 |
| FINANCE-08 | Antecipação de recebíveis | Could | V3 |
| FINANCE-09 | Nota fiscal automática integrada | Could | V3 |

### 4.7 Afiliados (AFFILIATE)

| ID | Requisito | Prioridade | Versão |
|---|---|---|---|
| AFFILIATE-01 | Ativar programa de afiliados por produto | Should | V2 |
| AFFILIATE-02 | Gerar link de afiliado exclusivo | Should | V2 |
| AFFILIATE-03 | Rastreamento via cookie (30 dias) | Should | V2 |
| AFFILIATE-04 | Comissão percentual ou valor fixo configurável | Should | V2 |
| AFFILIATE-05 | Dashboard do afiliado com vendas e comissões | Should | V2 |
| AFFILIATE-06 | Pagamento automático de comissões | Should | V2 |
| AFFILIATE-07 | Marketplace de afiliados | Could | V3 |

### 4.8 Notificações (NOTIFY)

| ID | Requisito | Prioridade | Versão |
|---|---|---|---|
| NOTIFY-01 | E-mail de confirmação de compra para comprador | Must | MVP |
| NOTIFY-02 | E-mail de nova venda para produtor | Must | MVP |
| NOTIFY-03 | E-mail de recuperação de senha | Must | MVP |
| NOTIFY-04 | E-mail de confirmação de saque | Must | MVP |
| NOTIFY-05 | Notificações in-app via Supabase Realtime | Should | V2 |
| NOTIFY-06 | Webhook outbound para integrações externas | Should | V2 |
| NOTIFY-07 | WhatsApp para confirmação de PIX | Could | V2 |

### 4.9 Analytics (ANALYTICS)

| ID | Requisito | Prioridade | Versão |
|---|---|---|---|
| ANALYTICS-01 | Dashboard com vendas do dia/semana/mês | Must | MVP |
| ANALYTICS-02 | Taxa de conversão do checkout | Must | MVP |
| ANALYTICS-03 | Gráfico de receita ao longo do tempo | Must | MVP |
| ANALYTICS-04 | Funil de checkout (visitas → início → pagamento → sucesso) | Should | V2 |
| ANALYTICS-05 | Métricas por produto | Should | V2 |
| ANALYTICS-06 | Exportação de relatórios | Should | V2 |
| ANALYTICS-07 | Comparativo de performance A/B | Could | V2 |

### 4.10 Administração (ADMIN)

| ID | Requisito | Prioridade | Versão |
|---|---|---|---|
| ADMIN-01 | Admin mínimo para aprovar/rejeitar KYC e produtores | Must | MVP |
| ADMIN-02 | Painel interno completo para gestão de produtores | Should | V2 |
| ADMIN-03 | Visão global de transações e GMV | Should | V2 |
| ADMIN-04 | Gestão de taxas por produtor | Should | V2 |
| ADMIN-05 | Logs de auditoria | Must | MVP |
| ADMIN-06 | Feature flags por produtor/plano | Could | V2 |

### 4.11 API Pública (API)

| ID | Requisito | Prioridade | Versão |
|---|---|---|---|
| API-01 | API REST via Route Handlers (OpenAPI) | Should | V2 |
| API-02 | Autenticação via API Key | Should | V2 |
| API-03 | Endpoints: produtos, transações, webhooks | Should | V2 |
| API-04 | Rate limiting por API Key | Should | V2 |
| API-05 | SDK JavaScript/TypeScript | Could | V3 |
| API-06 | Webhooks configuráveis pelo produtor | Should | V2 |

---

## 5. Requisitos Não Funcionais

### 5.1 Performance

| ID | Requisito | Meta |
|---|---|---|
| NFR-P01 | Tempo de carregamento do checkout (LCP) | < 2.0s |
| NFR-P02 | Tempo de resposta Server Actions / Route Handlers (p95) | < 300ms |
| NFR-P03 | Confirmação PIX após pagamento (Supabase Realtime) | < 3s |
| NFR-P04 | Processamento de cartão (autorização) | < 8s |
| NFR-P05 | Dashboard — carregamento inicial | < 3s |

### 5.2 Disponibilidade e Confiabilidade

| ID | Requisito | Meta |
|---|---|---|
| NFR-A01 | Uptime da plataforma | 99.5% (MVP) → 99.9% (V2) |
| NFR-A02 | Zero perda de transações confirmadas | 100% |
| NFR-A03 | Recovery point objective (RPO) | < 1 hora |
| NFR-A04 | Recovery time objective (RTO) | < 4 horas |
| NFR-A05 | Degradação graceful em falha de gateway | Obrigatório |

### 5.3 Segurança

| ID | Requisito | Meta |
|---|---|---|
| NFR-S01 | Criptografia em trânsito | TLS 1.3 |
| NFR-S02 | Criptografia em repouso (dados sensíveis) | AES-256 |
| NFR-S03 | Dados de cartão nunca armazenados (PCI DSS) | Tokenização via gateway |
| NFR-S04 | Proteção contra OWASP Top 10 | Obrigatório |
| NFR-S05 | Rate limiting via Upstash Redis em endpoints públicos | Obrigatório |
| NFR-S06 | Row Level Security (RLS) em todas as tabelas Supabase | Obrigatório |
| NFR-S07 | Auditoria de ações sensíveis | Obrigatório |
| NFR-S08 | Conformidade LGPD | Obrigatório |
| NFR-S09 | CSP e HSTS configurados em produção | Obrigatório |
| NFR-S10 | Cookies de sessão com `httpOnly`, `secure` e `sameSite` adequados | Obrigatório |
| NFR-S11 | Variáveis de ambiente validadas com Zod no runtime server-side | Obrigatório |
| NFR-S12 | Logs estruturados com mascaramento de PII, tokens, payloads de PSP e dados financeiros sensíveis | Obrigatório |

### 5.4 Escalabilidade

| ID | Requisito | Meta |
|---|---|---|
| NFR-E01 | Transações simultâneas no checkout | 1.000+ (MVP) |
| NFR-E02 | Produtores ativos na plataforma | 10.000+ (V2) |
| NFR-E03 | Arquitetura horizontalmente escalável | Obrigatório |
| NFR-E04 | Processamento assíncrono de eventos | Obrigatório |

### 5.5 Usabilidade

| ID | Requisito | Meta |
|---|---|---|
| NFR-U01 | Checkout funcional em mobile | Obrigatório |
| NFR-U02 | Onboarding completável em < 10 minutos | Obrigatório |
| NFR-U03 | Dashboard intuitivo sem treinamento | Obrigatório |
| NFR-U04 | Suporte a leitores de tela (WCAG 2.1 AA) | Should (V2) |

### 5.6 Observabilidade

| ID | Requisito | Meta |
|---|---|---|
| NFR-O01 | Logs estruturados + Sentry para erros | Obrigatório |
| NFR-O02 | Sentry Performance (APM) para Server Actions e Route Handlers | Should (V2) |
| NFR-O03 | Alertas automáticos para falhas críticas | Obrigatório |
| NFR-O04 | Dashboards de saúde da plataforma | Obrigatório |

### 5.7 Manutenibilidade

| ID | Requisito | Meta |
|---|---|---|
| NFR-M01 | Cobertura de testes unitários | > 80% |
| NFR-M02 | Cobertura de testes de integração (fluxos críticos) | 100% |
| NFR-M03 | Documentação de API atualizada automaticamente | Obrigatório |
| NFR-M04 | Deploy automatizado via GitHub Actions → Vercel com rollback | Obrigatório |

---

## 6. Regras de Negócio

### 6.1 Conta e Verificação

| ID | Regra |
|---|---|
| RN-01 | Produtor deve ter e-mail verificado para criar produtos |
| RN-02 | Produtor deve ter KYC aprovado para receber saques |
| RN-03 | CPF/CNPJ deve ser único por conta de produtor |
| RN-04 | Conta suspensa não pode processar novas vendas |
| RN-05 | Produtor pessoa física (CPF) limitado a R$ 50k/mês sem CNPJ |

### 6.2 Produtos

| ID | Regra |
|---|---|
| RN-10 | Preço mínimo de produto: R$ 5,00 |
| RN-11 | Preço máximo de produto: R$ 50.000,00 |
| RN-12 | Produto inativo não gera checkout funcional |
| RN-13 | Parcelamento disponível apenas para cartão de crédito |
| RN-14 | Número máximo de parcelas depende do valor (mínimo R$ 5/parcela) |

### 6.3 Pagamentos

| ID | Regra |
|---|---|
| RN-20 | PIX expira em 15 minutos após geração |
| RN-21 | Transação confirmada é irreversível sem estorno explícito |
| RN-22 | Idempotency key obrigatória para evitar cobrança duplicada |
| RN-23 | Cartão recusado permite até 3 tentativas por sessão de checkout |
| RN-24 | Split de pagamento no MVP: plataforma + produtor; afiliado entra apenas quando o módulo V2 estiver ativo |
| RN-25 | Taxa da plataforma deduzida no momento da confirmação |

### 6.4 Finanças e Repasse

| ID | Regra |
|---|---|
| RN-30 | Período de retenção padrão: D+7 após confirmação |
| RN-31 | Valor mínimo para saque: R$ 50,00 |
| RN-32 | Saques processados em dias úteis (D+1) |
| RN-33 | Saldo pendente = vendas confirmadas dentro do período de retenção |
| RN-34 | Saldo disponível = vendas confirmadas fora do período de retenção − saques |
| RN-35 | Chargeback debita saldo do produtor (disponível ou futuro) |

### 6.5 Afiliados

| ID | Regra |
|---|---|
| RN-40 | Cookie de afiliado válido por 30 dias (last-click) |
| RN-41 | Comissão calculada sobre valor líquido (após taxas) |
| RN-42 | Comissão paga somente após período de retenção da venda |
| RN-43 | Produtor define percentual de comissão (mín. 1%, máx. 80%) |
| RN-44 | Afiliado não pode promover produto de conta suspensa |

### 6.6 Taxas

| ID | Regra |
|---|---|
| RN-50 | Taxa padrão: 4.9% + R$ 1,00 por transação aprovada |
| RN-51 | Taxa PIX: 1.9% por transação |
| RN-52 | Taxa cartão: 4.9% + R$ 1,00 por transação |
| RN-53 | Planos com volume reduzem taxa (negociável a partir de R$ 100k/mês) |

---

## 7. Restrições e Premissas

### Premissas
- Pagamentos processados via **Payment Service** — abstração multi-provider sobre Stripe, Mercado Pago e Pagar.me
- MVP inicia com **um PSP real primário** (Mercado Pago ou Pagar.me); demais providers ficam como contratos/adapters preparados para evolução
- **Supabase** como backend-as-a-service: Database, Auth, Storage e Realtime
- **Vercel** para deploy, hosting, preview deploys, functions e rollback desde o MVP
- **Upstash Redis** para cache, rate limiting e idempotência
- Equipe inicial: 2–4 desenvolvedores full-stack
- Lançamento inicial focado no mercado brasileiro (BRL)

### Restrições
- Conformidade com LGPD e regulamentação do Banco Central (PIX)
- PCI DSS compliance via tokenização nos PSPs (sem armazenamento de dados de cartão)
- Webhooks executados em Node runtime, com raw body preservado e validação de assinatura antes de qualquer processamento
- Service role key do Supabase restrita a adapters server-only; nunca exposta ao frontend, Client Components, middleware público ou código compartilhado com browser
- Ambiente validado com Zod no bootstrap server-side
- CSP, HSTS, cookies `httpOnly`/`secure`/`sameSite`, rate limiting e logs mascarados são obrigatórios desde o MVP
- Orçamento de infraestrutura limitado no MVP (tiers free/pro)

---

## 8. Fora de Escopo (MVP)

- Marketplace de produtos
- Área de membros / LMS integrado
- Pagamentos internacionais
- Assinaturas recorrentes reais
- Fallback automático entre múltiplos PSPs reais
- App mobile nativo
- Antecipação de recebíveis
- Emissão de nota fiscal

---

## 9. Critérios de Aceite do MVP

- [ ] Produtor consegue se cadastrar, verificar identidade e criar produto em < 10 min
- [ ] Checkout público processa PIX e cartão com confirmação em tempo real
- [ ] Dashboard exibe vendas, saldo e extrato corretamente
- [ ] Produtor consegue solicitar saque após período de retenção
- [ ] E-mails transacionais são enviados para comprador e produtor
- [ ] Admin consegue aprovar/rejeitar KYC
- [ ] Plataforma mantém 99.5% uptime em ambiente de produção
- [ ] Payment Service possui contrato multi-provider e implementa pelo menos um PSP real (Mercado Pago ou Pagar.me) com PIX e cartão
- [ ] Confirmação PIX reflete no checkout via Supabase Realtime em < 3s
- [ ] RLS ativo em todas as tabelas — produtor não acessa dados de outro produtor
- [ ] Ledger financeiro append-only, `payment_events` e `outbox_events` persistem eventos críticos de pagamento e finanças
- [ ] Webhooks rodam em Node runtime com raw body, assinatura validada, idempotência e logs mascarados
- [ ] Deploy automatizado via GitHub Actions → Vercel com rollback funcional

---

*Última atualização: Julho 2026 — v2.0*

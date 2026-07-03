# Velto Pay — Contributing Guide

> Guia de contribuição para o time de engenharia. Versão 1.0 — Fundação.

---

## 1. Bem-vindo

Este documento define como contribuímos para a Velto Pay — padrões de código, convenções, fluxo de trabalho e boas práticas. Seguir estas diretrizes garante consistência, qualidade e velocidade no desenvolvimento.

**Referências:** [ARCHITECTURE.md](./ARCHITECTURE.md) · [PRD.md](./PRD.md) · [ROADMAP.md](./ROADMAP.md)

---

## 2. Setup do Ambiente

### Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 20 LTS |
| pnpm | 9.x |
| Docker | 24.x (para Supabase local, quando usado) |
| Git | 2.40+ |

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/amorim013/velto-pay.git
cd velto-pay

# Instalar dependências
pnpm install

# Subir Supabase local (quando configurado)
pnpm supabase:start

# Configurar variáveis de ambiente
cp .env.example .env

# Rodar migrations
pnpm supabase:db:push

# Seed de desenvolvimento (quando disponível)
pnpm db:seed

# Iniciar o app em dev
pnpm dev
```

### Apps disponíveis

| App | URL local | Descrição |
|---|---|---|
| `web` | http://localhost:3000 | Next.js App Router: dashboard, checkout, admin e Route Handlers |
| `supabase-studio` | http://localhost:54323 | Supabase Studio local, quando ativo |

---

## 3. Fluxo de Trabalho (Git)

### 3.1 Branches

```
main ───────────────────────────────────────── (produção)
  │
  └── develop ──────────────────────────────── (integração)
        │
        ├── feat/pix-payment
        ├── fix/checkout-validation
        └── chore/update-dependencies
```

| Branch | Propósito | Merge para |
|---|---|---|
| `main` | Código em produção | — |
| `develop` | Integração contínua | `main` (via release) |
| `feat/*` | Nova funcionalidade | `develop` |
| `fix/*` | Correção de bug | `develop` (ou `main` se hotfix) |
| `chore/*` | Manutenção, deps, configs | `develop` |
| `docs/*` | Documentação | `develop` |
| `refactor/*` | Refatoração sem mudança de behavior | `develop` |
| `test/*` | Adição/melhoria de testes | `develop` |

### 3.2 Commits — Conventional Commits

Formato: `type(scope): description`

```
feat(payments): add PIX webhook handler
fix(checkout): validate CPF before submission
docs(readme): update setup instructions
chore(deps): upgrade supabase client
refactor(auth): extract session validation helper
test(products): add unit tests for product service
ci(pipeline): add e2e tests to PR checks
perf(analytics): optimize sales aggregation query
```

**Regras:**
- Descrição em inglês, imperativo, lowercase, sem ponto final
- Máximo 72 caracteres no subject
- Body opcional para contexto adicional
- Referenciar issue quando aplicável: `feat(payments): add PIX webhook (#42)`

### 3.3 Pull Requests

1. Criar branch a partir de `develop`
2. Implementar a feature/fix com testes
3. Garantir que lint e testes passam localmente
4. Abrir PR para `develop` com template preenchido
5. Code review por pelo menos 1 membro do time
6. CI deve passar (lint, test, build)
7. Squash merge após aprovação

**Template de PR:**

```markdown
## Descrição
Breve descrição do que foi feito e por quê.

## Tipo de mudança
- [ ] feat (nova funcionalidade)
- [ ] fix (correção de bug)
- [ ] refactor (refatoração)
- [ ] docs (documentação)
- [ ] chore (manutenção)

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Lint passa sem erros
- [ ] Documentação atualizada (se aplicável)
- [ ] Sem secrets ou credenciais commitadas
- [ ] Testado localmente

## Screenshots (se UI)
```

---

## 4. Padrões de Código

### 4.1 TypeScript

```typescript
// ✓ Usar tipos explícitos em funções públicas
function calculateFee(amount: number, rate: number): number {
  return amount * rate;
}

// ✓ Preferir const, evitar any
const status: TransactionStatus = TransactionStatus.PAID;

// ✓ Usar enums para valores finitos
enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// ✓ Usar Zod para validação de runtime
const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().positive().max(50000),
  type: z.literal('one_time'),
});

// ✗ Evitar
let data: any = fetchSomething();
```

### 4.2 Backend (Next.js Server Actions e Route Handlers)

```typescript
// ✓ Server Action fina — valida entrada, autentica e chama use case
'use server';

export async function createProductAction(input: unknown) {
  const payload = createProductSchema.parse(input);
  const user = await requireProducer();
  return createProductUseCase.execute({ producerId: user.id, ...payload });
}

// ✓ Route Handler fino — webhooks ficam em Node runtime e preservam raw body
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-provider-signature');
  return handlePaymentWebhookUseCase.execute({ rawBody, signature });
}
```

### 4.3 Frontend (Next.js + React)

```tsx
// ✓ Server Component por padrão
export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductList products={products} />;
}

// ✓ Client Component apenas quando necessário
'use client';

export function CheckoutForm({ productId }: { productId: string }) {
  const { mutate, isPending } = useCreatePayment();
  // ...
}

// ✓ Custom hooks para lógica reutilizável
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}
```

### 4.4 Error Handling

```typescript
// ✓ Exceções customizadas do domínio
export class InsufficientBalanceError extends DomainError {
  constructor(available: number, requested: number) {
    super(
      `Insufficient balance: available ${available}, requested ${requested}`,
      'INSUFFICIENT_BALANCE',
      HttpStatus.BAD_REQUEST,
    );
  }
}

// ✓ Error boundaries no React
// ✓ Result discriminated unions em Server Actions
// ✓ Logs estruturados sem PII
// ✓ Nunca silenciar erros — log + re-throw ou handle explícito
```

---

## 5. Convenções de Nomenclatura

Consulte [ARCHITECTURE.md — Seção 9](./ARCHITECTURE.md#9-convenções-de-nomenclatura) para a tabela completa.

**Resumo rápido:**

| Contexto | Convenção | Exemplo |
|---|---|---|
| Arquivos | kebab-case | `checkout-session.service.ts` |
| Classes | PascalCase | `CheckoutSessionService` |
| Funções/variáveis | camelCase | `createCheckoutSession()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| DB tables/columns | snake_case | `checkout_sessions`, `created_at` |
| API routes | kebab-case, plural | `/api/v1/checkout-sessions` |
| React components | PascalCase | `CheckoutForm` |
| React hooks | `use` + PascalCase | `useCheckoutSession()` |
| Env vars | UPPER_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |
| Git branches | type/kebab-case | `feat/pix-payment` |

---

## 6. Testes

### 6.1 Estratégia

| Tipo | Ferramenta | Escopo | Cobertura mínima |
|---|---|---|---|
| Unit | Jest / Vitest | Services, utils, validators | 80% |
| Integration | Vitest + Supabase local | Use cases, Route Handlers, DB policies | Fluxos críticos |
| E2E | Playwright | Fluxos completos (checkout, pagamento) | Happy paths |
| Component | Testing Library | Componentes React isolados | Componentes core |

### 6.2 Nomenclatura de Testes

```typescript
describe('ProductService', () => {
  describe('create', () => {
    it('should create a product with valid data', async () => { ... });
    it('should throw when price is below minimum', async () => { ... });
    it('should generate unique slug from product name', async () => { ... });
  });
});
```

### 6.3 Regras

- Testes rodam no CI em todo PR
- Fluxos financeiros (pagamento, saque, split) **devem** ter testes de integração
- Não mockar o banco em testes de integração — usar banco de teste
- Factories/fixtures para dados de teste (não hardcode)
- Testes devem ser independentes (sem ordem, sem estado compartilhado)

---

## 7. Banco de Dados

### 7.1 Migrations

```bash
# Criar migration
pnpm supabase:migration:new add_products_table

# Aplicar migrations
pnpm supabase:db:push

# Reset (dev only)
pnpm supabase:db:reset
```

**Regras:**
- Toda alteração de schema via migration SQL do Supabase
- Migrations são imutáveis — nunca editar migration já aplicada
- Nomes descritivos: `add_checkout_sessions`, `add_payment_status_index`
- Indexes explícitos para queries frequentes

### 7.2 Queries

```typescript
// ✓ Usar Supabase types gerados
const { data, error } = await supabase
  .from('transactions')
  .select('id,status,amount_cents,created_at')
  .eq('producer_id', producerId)
  .order('created_at', { ascending: false })
  .limit(20);

if (error) throw error;

// ✓ Select apenas campos necessários
// ✓ Preferir RPC SQL para agregações financeiras pesadas
// ✗ Evitar raw SQL fora de migrations/RPC versionadas
// ✗ Evitar N+1 queries
```

---

## 8. Segurança — Checklist do Desenvolvedor

Antes de abrir PR, verificar:

- [ ] Nenhum secret/credencial no código (usar env vars)
- [ ] Input validado com Zod
- [ ] Server Actions e Route Handlers protegidos com auth/roles quando aplicável
- [ ] Dados sensíveis (CPF, dados bancários) criptografados
- [ ] Rate limiting em endpoints públicos
- [ ] RLS ativo e testado nas tabelas de negócio
- [ ] Webhooks em Node runtime, raw body preservado e assinatura validada
- [ ] Service role usada apenas por adapters server-only
- [ ] CSP, HSTS e cookies seguros configurados
- [ ] Variáveis de ambiente validadas com Zod
- [ ] XSS prevenido (sanitização de output)
- [ ] Logs mascaram PII, tokens, payloads de PSP e dados financeiros sensíveis

---

## 9. Code Review

### O que revisar

| Aspecto | Foco |
|---|---|
| **Corretude** | Lógica de negócio, edge cases, regras do PRD |
| **Segurança** | Auth, input validation, dados sensíveis |
| **Performance** | N+1 queries, cache, payloads desnecessários |
| **Legibilidade** | Nomes claros, funções pequenas, sem over-engineering |
| **Testes** | Cobertura adequada, casos de erro testados |
| **Consistência** | Segue convenções deste documento |

### Princípios

- Feedback construtivo, nunca pessoal
- Aprovar se o PR melhora o codebase (não exigir perfeição)
- Bloquear apenas por: bugs, vulnerabilidades, violação de regras de negócio
- Sugestões de melhoria são opcionais, não bloqueantes

---

## 10. Ambiente e Variáveis

### Arquivos de ambiente

```
.env                  # Local (nunca commitado)
.env.example          # Template commitado (sem valores reais)
.env.test             # Testes automatizados
.env.staging          # Staging (CI/CD secrets)
.env.production       # Produção (CI/CD secrets)
```

### Variáveis core

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon pública do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role, apenas server-only |
| `UPSTASH_REDIS_REST_URL` | URL REST do Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Token REST do Upstash Redis |
| `PAYMENT_PROVIDER` | PSP primário ativo no ambiente |
| `PAYMENT_PROVIDER_API_KEY` | API key do PSP primário |
| `PAYMENT_PROVIDER_WEBHOOK_SECRET` | Secret para validar webhooks do PSP |
| `RESEND_API_KEY` | API key do provider de e-mail |
| `SENTRY_DSN` | Error tracking |

---

## 11. Comandos Úteis

```bash
# Desenvolvimento
pnpm dev                    # Inicia o app Next.js

# Qualidade
pnpm lint                   # ESLint
pnpm lint:fix               # ESLint com auto-fix
pnpm typecheck              # TypeScript check
pnpm test                   # Testes unitários
pnpm test:integration       # Testes de integração
pnpm test:e2e               # Testes E2E

# Banco de dados
pnpm supabase:start         # Iniciar Supabase local
pnpm supabase:migration:new # Criar migration
pnpm supabase:db:push       # Aplicar migrations
pnpm supabase:db:reset      # Reset local
pnpm supabase:gen-types     # Gerar database.types.ts

# Build
pnpm build                  # Build do Next.js
```

---

## 12. Architecture Decision Records (ADRs)

Decisões arquiteturais significativas são documentadas em `docs/decisions/`:

```
docs/decisions/
├── 001-nextjs-fullstack.md
├── 002-supabase-baas.md
├── 003-vercel-deploy.md
├── 004-payment-service.md
└── ...
```

**Quando criar um ADR:**
- Escolha de tecnologia/framework
- Mudança de padrão arquitetural
- Trade-off significativo que afeta o time
- Decisão difícil de reverter

**Formato:**

```markdown
# ADR-NNN: Título da Decisão

## Status
Aceito | Proposto | Depreciado

## Contexto
Por que precisamos decidir?

## Decisão
O que decidimos?

## Consequências
Prós e contras da decisão.
```

---

*Última atualização: Julho 2026*

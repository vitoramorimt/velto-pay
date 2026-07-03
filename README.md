# Velto Pay

Plataforma SaaS brasileira de checkout e pagamentos para produtores digitais.

## Status

Projeto em fase de fundacao arquitetural. A aplicacao Next.js ja possui
bootstrap tecnico, Design System e autenticacao base com Supabase Auth.

## Stack alvo

- Next.js 15 (App Router)
- TypeScript strict
- Tailwind CSS + shadcn/ui
- Supabase + PostgreSQL
- React Hook Form + Zod
- TanStack Query
- Vercel

## Direcao do MVP

O MVP deve permitir que um produtor crie um produto de pagamento unico, gere um checkout publico e processe pagamentos com PIX/cartao usando um Payment Service multi-provider, com apenas um PSP real implementado inicialmente.

Assinaturas, multi-PSP ativo, afiliados completos e API publica ficam para fases posteriores.

## Banco de dados versionado

O schema PostgreSQL da Velto Pay deve ser evoluido apenas por migrations SQL
versionadas em `supabase/migrations/`. A pasta ja esta preparada, mas ainda nao
existe migration inicial neste repositorio.

### Pre-requisitos

- Docker em execucao
- Dependencias instaladas com `pnpm install`
- Variaveis locais em `.env.local`

### Fluxo local

```bash
# Inicia a stack local do Supabase
pnpm supabase:start

# Para a stack local
pnpm supabase:stop

# Cria uma migration vazia para uma alteracao planejada
pnpm supabase:migration:new nome_da_migration

# Gera uma migration a partir do diff do banco local
pnpm supabase:migration:diff nome_da_migration

# Recria o banco local aplicando todas as migrations e seed.sql
pnpm supabase:db:reset

# Gera os tipos TypeScript a partir do banco local
pnpm supabase:gen-types
```

### Banco remoto

`pnpm supabase:db:push` existe para aplicar migrations em um projeto Supabase
linkado, mas so deve ser executado com autorizacao explicita. O fluxo padrao de
desenvolvimento e validar tudo localmente antes de qualquer alteracao remota.

### Regras

- Nunca alterar tabelas manualmente no dashboard sem refletir em migration.
- Nunca editar migrations ja aplicadas em ambientes compartilhados.
- Manter `src/shared/database.types.ts` atualizado apos mudancas de schema.
- `supabase/seed.sql` deve conter apenas dados seguros para desenvolvimento.

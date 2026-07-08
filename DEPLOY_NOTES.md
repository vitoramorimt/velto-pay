# Avisos de deploy

Notas para quem for aplicar o deploy (Vercel/Supabase) do que foi commitado recentemente na `main`.

## 2026-07-08 — Order bumps + consolidação do checkout

Commits: `2c9e219` (consolidação do checkout na página do produto) e `4acd1ff` (order bumps).

### ⚠️ Migration pendente no Supabase remoto

A migration `supabase/migrations/20260707233000_add_checkout_offer_product_link.sql` **ainda não foi aplicada no banco remoto**. Ela adiciona a coluna `product_id` (FK para `products`) na tabela `checkout_offers`, necessária para o recurso de order bumps funcionar em produção.

```sql
alter table public.checkout_offers
add column if not exists product_id uuid references public.products(id) on delete cascade;

create unique index if not exists checkout_offers_checkout_product_idx
on public.checkout_offers (checkout_id, product_id)
where product_id is not null;
```

Aplique via SQL editor do Supabase **ou** rode `supabase db push` — mas atenção ao ponto abaixo antes de tentar o `db push`.

### ⚠️ Histórico de migrations local está incompleto

A pasta local `supabase/migrations` está sem 4 arquivos que já foram aplicados no banco remoto (problema anterior a este trabalho, não causado por ele). Isso faz `supabase db push` falhar até o histórico ser reconciliado (`supabase migration repair` ou baixar os arquivos faltantes do remoto). Sem resolver isso, a rota mais segura é aplicar o SQL acima manualmente pelo SQL editor.

### `database.types.ts` editado à mão

Como a migration não foi aplicada remotamente, não deu pra rodar `supabase gen types`. Editei `src/shared/database.types.ts` manualmente para incluir `product_id` em `checkout_offers`. Depois de aplicar a migration remota, vale rodar o gen types normal para conferir que bate.

### Sem mudança de variáveis de ambiente

Nenhuma env var nova foi adicionada nesses commits.

### O que já funciona sem a migration

Em ambiente local com `DEV_BYPASS_AUTH=true` o recurso todo funciona (mock store em memória, sem depender do Supabase). Em produção, sem a migration aplicada, a criação de order bumps vai falhar (coluna `product_id` não existe).

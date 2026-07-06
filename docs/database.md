# Banco de Dados

O banco da Velto Pay é PostgreSQL via Supabase, versionado em `supabase/migrations`.

## Entidades Principais

- `users`: perfil público vinculado ao Supabase Auth.
- `producers`: produtor dono de produtos, checkouts e finanças.
- `products`: produtos digitais.
- `checkouts`: links públicos publicados.
- `customers`: compradores.
- `orders`: pedidos criados no checkout.
- `payments`: pagamentos por pedido.
- `transactions`: movimentos técnicos do gateway.
- `ledger_entries`: livro financeiro append-only.
- `payment_events`: eventos de pagamento append-only.
- `outbox_events`: fila transacional para efeitos assíncronos.
- `webhooks`: envelope dos eventos recebidos de PSPs.

## Segurança

Todas as tabelas relevantes usam RLS. Produtores só leem dados vinculados ao próprio `producer_id`. Operações públicas de checkout passam por funções `security definer` controladas e validadas.

## Regras

- Nunca alterar schema manualmente no dashboard sem migration.
- Nunca editar migration aplicada em ambiente compartilhado.
- Atualizar `src/shared/database.types.ts` após mudança de schema.
- Usar constraints, índices e FKs para invariantes críticas.

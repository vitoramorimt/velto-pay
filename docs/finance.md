# Financeiro

O financeiro é derivado de pedidos, pagamentos e ledger.

## Métricas

- Receita bruta.
- Receita líquida.
- Reembolsos.
- Chargebacks.
- Saldo disponível.
- Saldo pendente/bloqueado.

## Ledger

`ledger_entries` é append-only. Entradas são criadas quando webhooks confirmam eventos financeiros.

## Princípios

- Nunca atualizar ledger diretamente no frontend.
- Evitar deleções e updates em lançamentos financeiros.
- Usar idempotência para webhooks.

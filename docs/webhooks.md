# Webhooks

Webhooks são Route Handlers em Node runtime.

## Rota

`POST /api/payments/webhooks/[provider]`

## Regras

- Ler raw body.
- Validar assinatura antes de processar.
- Persistir envelope em `webhooks`.
- Persistir evento em `payment_events`.
- Atualizar pagamento, pedido e ledger por função transacional.
- Usar status normalizado interno.

## Stripe

Use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/payments/webhooks/stripe
```

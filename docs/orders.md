# Pedidos

Pedidos representam a intenção de compra criada a partir de um checkout.

## Status

- `pending`
- `paid`
- `failed`
- `refunded`
- `chargeback`
- `canceled`
- `cancelled`
- `expired`

## Relacionamentos

- `producer_id`
- `product_id`
- `checkout_id`
- `customer_id`
- `payments`
- `ledger_entries`

## Regra de Ouro

Pedido só deve impactar métricas de venda quando o pagamento associado for confirmado pelo webhook.

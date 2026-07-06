# Pagamentos

O módulo `payments` é uma fundação multi-provider com contratos estáveis.

## Interface

`PaymentProvider` expõe:

- `createCheckout`
- `capturePayment`
- `cancelPayment`
- `refund`
- `getPayment`
- `webhook`

## Providers

- Stripe: implementado em sandbox/test com Stripe Checkout.
- Mercado Pago: preparado via sandbox adapter.
- Asaas: preparado via sandbox adapter.
- Pagar.me: preparado via sandbox adapter.

## Configuração

`PAYMENT_PROVIDER` define o provider ativo. O MVP usa `stripe`.

## Segurança

Pagamentos só são contabilizados após webhook assinado. A página pública nunca confirma venda sozinha.

## Eventos

Eventos suportados no Stripe:

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`

# Checkout

O checkout público fica em `/pay/[slug]` e é renderizado por Server Components.

## Fluxo

1. Carrega produto e checkout publicado.
2. Exibe oferta, preço, garantias e badges de segurança.
3. Coleta nome e e-mail.
4. Server Action valida Zod.
5. Payment use case cria tentativa de pagamento.
6. Provider redireciona para Stripe Checkout.

## Regras

- Nunca confiar em valores vindos do frontend.
- Recalcular total no servidor.
- Preservar UTMs em metadata.
- Confirmar venda apenas por webhook.

## Evolução

Sprint 11 adiciona base premium com order bump, cupons, pixels, UTMs, resumo do pedido e página de obrigado.

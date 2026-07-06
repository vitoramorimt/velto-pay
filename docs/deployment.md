# Deploy

Deploy alvo: Vercel.

## Ambientes

- Development: máquina local.
- Sandbox: Stripe test + Supabase staging/local.
- Production: Vercel + Supabase production + Stripe live.

## Variáveis

- Supabase URL e anon key.
- Supabase service role key apenas no servidor, usada por adapters de entrega
  de notificações.
- `PAYMENT_PROVIDER`
- `PAYMENT_ENVIRONMENT`
- Stripe keys e webhook secret.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

## Push notifications

Gere as chaves VAPID com:

```bash
corepack pnpm exec web-push generate-vapid-keys
```

Configure na Vercel:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: chave pública VAPID.
- `VAPID_PRIVATE_KEY`: chave privada VAPID.
- `VAPID_SUBJECT`: contato do remetente, como `mailto:suporte@veltopay.com.br`.
- `SUPABASE_SERVICE_ROLE_KEY`: chave server-only para ler subscriptions e enviar
  push após webhooks. Nunca expor ao frontend.

Se as chaves VAPID não estiverem configuradas, a aplicação continua estável e
mostra uma mensagem amigável informando que notificações ainda não estão
disponíveis no ambiente.

## Checklist

- `corepack pnpm lint`
- `corepack pnpm test`
- `corepack pnpm typecheck`
- `corepack pnpm build`
- Migrations aplicadas com autorização explícita.

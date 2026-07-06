# Padrões de Código

## TypeScript

- Strict mode obrigatório.
- Preferir tipos de domínio explícitos.
- Validar inputs com Zod.

## React/Next

- Server Components por padrão.
- Client Components apenas quando houver estado/interação.
- Server Actions para mutações internas.
- Route Handlers para webhooks e APIs externas.

## Arquitetura

- Domain não importa infrastructure.
- Use cases coordenam regras.
- Repositories concentram Supabase.
- Providers externos ficam server-only.

## UX

- Mobile-first.
- Estados vazios claros.
- Loading e erros previsíveis.
- Nenhuma ação visível deve quebrar silenciosamente.

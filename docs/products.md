# Produtos

Produtos são gerenciados por produtores autenticados e vinculados ao `producer_id`.

## Funcionalidades

- Listar produtos.
- Criar produto em modal.
- Editar produto.
- Ativar/inativar.
- Gerar checkout público.

## Regras

- Preço mínimo: R$ 5,00.
- Moeda inicial: BRL.
- Produto ativo publica checkout.
- Produto inativo desabilita checkout público.

## Arquitetura

- Domain: schemas, tipos, slug e money helpers.
- Application: use cases autenticados.
- Infrastructure: Supabase repository.
- Presentation: forms, dialogs, tabelas e actions.

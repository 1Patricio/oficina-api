# Oficina API

MVP do back-end do Sistema Integrado de Atendimento e Execução de Serviços de uma oficina mecânica, desenvolvido para o Tech Challenge da Fase 1 da pós-graduação FIAP SOAT (Software Architecture).

- Grupo 67: Anderson Goularte Patricio (RM378389)
- Vídeo de apresentação: _link do YouTube a incluir_
- Documentação DDD (Event Storming, diagramas e linguagem ubíqua): [board no Miro](https://miro.com/app/board/uXjVETvEsw4=/)
- Relatório de vulnerabilidades: _a incluir_

## Objetivo

Digitalizar o atendimento da oficina: cadastro de clientes, veículos, serviços e peças, abertura e acompanhamento da ordem de serviço, orçamento com aprovação do cliente e controle de estoque.

## Solução

- **Cadastros:** clientes, veículos, serviços e materiais (peças e insumos) com CRUD completo. A exclusão é lógica (`deletedAt`) e, para clientes e veículos, cadastrar de novo o mesmo documento ou a mesma placa reativa o registro excluído.
- **Ordem de serviço:** nasce como `RECEBIDA` e segue por `DIAGNOSTICO`, `AGUARDANDO_APROVACAO`, `EXECUCAO`, `FINALIZADA` e `ENTREGUE`. Cada ordem recebe um número e guarda o orçamento com os serviços e os materiais usados.
- **Orçamento:** ao enviar o orçamento, o cliente recebe um e-mail com o número da ordem. Ele pode ser reenviado, aprovado ou rejeitado pela equipe e também pelo cliente, por rotas públicas que exigem o documento e a placa da ordem.
- **Estoque:** a baixa dos materiais acontece na aprovação do orçamento. Há uma rota de reposição e a edição de um material preserva o estoque.
- **Acompanhamento:** o cliente consulta suas ordens pela rota pública (documento e placa) e a equipe consulta o tempo médio de execução.
- **Autenticação:** as rotas da equipe exigem um token JWT, obtido no login. Um administrador é criado na subida da aplicação, se ainda não existir.

## Arquitetura

O código segue DDD, com um módulo por contexto e as camadas separadas dentro de cada um:

```text
src/
├── core/        # banco (Prisma), guard de JWT, filtro de erros de domínio, pipes e DTOs comuns
├── shared/      # objetos de valor e erros de domínio usados por todos os módulos
└── modules/
    ├── clientes/
    ├── veiculos/
    ├── servicos/
    ├── estoque/
    ├── ordens-servico/
    └── usuarios/
        ├── domain/       # entidades, objetos de valor e contratos dos repositórios
        ├── use-cases/    # um caso de uso por operação
        ├── infra/        # repositórios com Prisma
        ├── controllers/  # rotas, DTOs e documentação do Swagger
        └── __test__/     # dublês de teste do módulo
```

O domínio não depende de NestJS nem de Prisma: os casos de uso falam com contratos de repositório, e a camada `infra` os implementa. Os testes ficam em `__test__` ao lado de cada camada.

A documentação DDD (Event Storming, glossário da linguagem ubíqua, diagrama de classes, mapa de contextos e modelo C4) está no [board do Miro](https://miro.com/app/board/uXjVETvEsw4=/).

## Tecnologias

- TypeScript e Node.js 24
- NestJS 11
- PostgreSQL 18 com Prisma 7
- JWT (`@nestjs/jwt`) e bcrypt para a senha
- Swagger/OpenAPI (`@nestjs/swagger`)
- Nodemailer, com o Mailpit como servidor SMTP local
- Vitest e Biome
- Docker e Docker Compose

## Por que PostgreSQL ?

O banco de dados principal da API é o PostgreSQL, um SGBD relacional escolhido pela natureza transacional do domínio da oficina. Como entidades como clientes, veículos, ordens de serviço, orçamentos e estoque são interdependentes, o uso do PostgreSQL garante a integridade e a consistência dos dados em operações que alteram múltiplos registros simultaneamente.

## Pré-requisitos

- Docker e Docker Compose, para subir a aplicação completa
- Node.js 24 (`.nvmrc`) e npm, para rodar os testes e o modo de desenvolvimento

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores se quiser:

```bash
cp .env.example .env
```

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta da API (padrão `3000`) |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Credenciais do PostgreSQL usadas pelo Docker Compose |
| `DATABASE_URL` | Conexão com o banco quando a aplicação roda fora do Docker |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` | Servidor SMTP e remetente do e-mail do orçamento |
| `JWT_SECRET` | Segredo do JWT, com no mínimo 32 caracteres |
| `ADMIN_NOME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Administrador criado na subida da aplicação |

## Como executar

### Com Docker (recomendado)

```bash
docker compose up --build
```

O Compose sobe o PostgreSQL, o Mailpit, aplica as migrações (`migrate`) e só então inicia a API (`app`).

| Serviço | Endereço |
| --- | --- |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/docs |
| Mailpit (e-mails enviados) | http://localhost:8025 |
| PostgreSQL | `localhost:5432` |

### Em modo de desenvolvimento

Suba só o banco e o Mailpit, aplique as migrações e rode a API com recarga automática:

```bash
npm ci
docker compose up -d postgres mailpit
npx prisma migrate deploy
npx prisma generate
npm run start:dev
```

## Autenticação

1. Abra o Swagger em http://localhost:3000/docs.
2. Chame `POST /auth/login` com `email` e `senha`, que são o `ADMIN_EMAIL` e a `ADMIN_PASSWORD` do `.env` (no exemplo, `admin@oficina.local` e `admin12345`).
3. Copie o `token` da resposta, clique em **Authorize** e cole o valor.

As rotas de `/clientes`, `/veiculos`, `/servicos`, `/materiais` e `/ordens-servico` exigem o token. Só `/ping`, `/auth/login` e `/public/ordens-servico` são abertas.

## Rotas

| Recurso | Rotas |
| --- | --- |
| Saúde e login | `GET /ping` e `POST /auth/login` |
| Clientes, veículos, serviços e materiais | `POST /`, `GET /`, `GET /:id`, `PUT /:id` e `DELETE /:id` em cada recurso |
| Reposição de estoque | `POST /materiais/:id/reposicao` |
| Ordem de serviço (equipe) | `POST /ordens-servico`, `GET /ordens-servico`, `GET /ordens-servico/:id`, `GET /ordens-servico/tempo-medio` |
| Fluxo da ordem | `POST /ordens-servico/:id/` com `itens`, `iniciar-diagnostico`, `enviar-orcamento`, `reenviar-orcamento`, `aprovar-orcamento`, `rejeitar-orcamento`, `finalizar` e `entregar` |
| Consulta e resposta do cliente | `GET /public/ordens-servico?documento=&placa=`, `POST /public/ordens-servico/:id/aprovar-orcamento` e `POST /public/ordens-servico/:id/rejeitar-orcamento` |

O detalhe de cada rota (corpo, query e respostas) está no Swagger.

## Fluxo da ordem de serviço

1. Com o cliente e o veículo já cadastrados, a equipe abre a ordem (`POST /ordens-servico`) com o documento do cliente, o veículo e, se quiser, serviços e materiais.
2. Inicia o diagnóstico e inclui os itens necessários (serviços e materiais).
3. Envia o orçamento. O cliente recebe o e-mail com o número da ordem, visível no Mailpit.
4. O cliente consulta a ordem pela rota pública e aprova ou rejeita o orçamento, ou a equipe registra a resposta. A aprovação baixa o estoque.
5. A equipe finaliza a ordem e entrega o veículo.

## Testes

```bash
npm test                # executa todos os testes
npm run test:watch      # modo observação
npm run test:coverage   # testes com cobertura
```

Qualidade do código:

```bash
npm run lint            # Biome
npm run typecheck       # TypeScript
```

## Análise de vulnerabilidades

Relatório a incluir.

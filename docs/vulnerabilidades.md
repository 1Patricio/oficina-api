# Análise de vulnerabilidades

Análise das dependências do projeto com `npm audit`, feita em 16/11/2026 (npm 10.9.8) sobre o `package-lock.json` do repositório.

## Resultado

| Escopo | Comando | Vulnerabilidades |
| --- | --- | --- |
| Produção | `npm audit --omit=dev` | 0 |
| Completo (produção e desenvolvimento) | `npm audit` | 11 moderadas (nenhuma baixa, alta ou crítica) |

São 805 dependências no total, sendo 286 de produção. Os 11 pacotes afetados vêm de 3 avisos de segurança e estão todos em dependências de desenvolvimento.

## Avisos encontrados

| Aviso | Gravidade | Pacote | Quem traz | Correção do npm |
| --- | --- | --- | --- | --- |
| [GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8) e [GHSA-xp26-3454-mjgp](https://github.com/advisories/GHSA-xp26-3454-mjgp): injeção de código no registro manual de mocks e desvio da lista de redirecionamento no Windows | Moderada | `@vitest/mocker` (até 4.1.11) | `vitest` e `@vitest/coverage-v8` | `npm audit fix`, sem troca de versão major |
| [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4): `glob` permite percorrer o sistema de arquivos depois do tempo limite | Moderada | `glob` (9.0.0 a 14.0.1) | `@nestjs/cli` e, por `archiver-utils`, `@testcontainers/postgresql` | `@nestjs/cli@12`, troca major |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249): negação de serviço no `minimatch` | Moderada | `minimatch` (7.0.0 a 11.0.0) | `glob` | `@nestjs/cli@12`, troca major |

Os 11 pacotes são `@nestjs/cli`, `@testcontainers/postgresql`, `@vitest/coverage-v8`, `@vitest/mocker`, `archiver`, `archiver-utils`, `glob`, `minimatch`, `testcontainers`, `vitest` e `zip-stream`.

## Avaliação de risco

- **Nada disso vai para produção.** A imagem Docker instala com `npm ci --omit=dev`, e dentro do contêiner da aplicação não existem `vitest`, `@nestjs/cli` nem `@testcontainers/postgresql`. O que roda em produção tem 0 vulnerabilidades.
- **O alcance é a máquina de quem desenvolve e o CI.** Os três avisos dependem de entrada controlada por um atacante em ferramentas de build e de teste: registro manual de mocks, padrões de `glob` e `minimatch`. O projeto não passa entrada externa para essas ferramentas.
- **Nenhuma vulnerabilidade alta ou crítica.**

## Tratamento

1. **`@testcontainers/postgresql` não é usado.** Nenhum arquivo do projeto o importa, e os testes rodam sem Docker. Removê-lo elimina 5 dos 11 itens (`@testcontainers/postgresql`, `testcontainers`, `archiver`, `archiver-utils` e `zip-stream`).
2. **`vitest` e `@vitest/coverage-v8`** têm correção sem troca de versão major, via `npm audit fix`.
3. **`@nestjs/cli`, `glob` e `minimatch`** só têm correção com a troca major do `@nestjs/cli` para a versão 12. Fica como risco aceito: é ferramenta de build, fora da imagem de produção, e a troca não cabe no escopo do MVP.

Para repetir a análise:

```bash
npm audit --omit=dev   # produção
npm audit              # completo
```

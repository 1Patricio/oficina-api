# Análise de vulnerabilidades

Análise das dependências do projeto com `npm audit`, feita em 16/11/2026 (npm 10.9.8) sobre o `package-lock.json` do repositório.

## Resultado

| Escopo | Comando | Vulnerabilidades |
| --- | --- | --- |
| Produção | `npm audit --omit=dev` | 0 |
| Completo (produção e desenvolvimento) | `npm audit` | 3 moderadas (nenhuma baixa, alta ou crítica) |

São 670 dependências no total, sendo 273 de produção. Os 3 pacotes afetados vêm de 2 avisos de segurança e estão todos em dependências de desenvolvimento.

## Avisos encontrados

| Aviso | Gravidade | Pacote | Quem traz | Correção do npm |
| --- | --- | --- | --- | --- |
| [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4): `glob` permite percorrer o sistema de arquivos depois do tempo limite | Moderada | `glob` (9.0.0 a 14.0.1) | `@nestjs/cli` | `@nestjs/cli@12`, troca major |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249): negação de serviço no `minimatch` | Moderada | `minimatch` (7.0.0 a 11.0.0) | `glob` | `@nestjs/cli@12`, troca major |

Os 3 pacotes são `@nestjs/cli`, `glob` e `minimatch`.

## Avaliação de risco

- **Nada disso vai para produção.** A imagem Docker instala com `npm ci --omit=dev`, e dentro do contêiner da aplicação não existe o `@nestjs/cli`. O que roda em produção tem 0 vulnerabilidades.
- **O alcance é a máquina de quem desenvolve e o CI.** Os dois avisos dependem de entrada controlada por um atacante nos padrões de `glob` e `minimatch`, usados pelo build do Nest. O projeto não passa entrada externa para essas ferramentas.
- **Nenhuma vulnerabilidade alta ou crítica.**

## Tratamento

Na primeira análise, o `npm audit` completo apontava 11 itens moderados. Foram corrigidos 8:

1. **`@testcontainers/postgresql` removido.** Nenhum arquivo do projeto o importava, e os testes rodam sem Docker. A remoção eliminou 5 itens (`@testcontainers/postgresql`, `testcontainers`, `archiver`, `archiver-utils` e `zip-stream`).
2. **`vitest` e `@vitest/coverage-v8` atualizados da 4.1.11 para a 5.1.0**, que corrige os avisos do `@vitest/mocker` (GHSA-qxg6-89mg-rqv8 e GHSA-xp26-3454-mjgp). A 4.x não tem correção, então foi uma troca de versão major. Depois dela, os 303 testes, o `typecheck`, o `lint` e a cobertura continuaram passando, e a imagem Docker continua sendo construída.

Os 3 itens restantes (`@nestjs/cli`, `glob` e `minimatch`) só têm correção com a troca major do `@nestjs/cli` para a versão 12. Ficam como **risco aceito**: é ferramenta de build, fora da imagem de produção, e a troca não cabe no escopo do MVP.

Para repetir a análise:

```bash
npm audit --omit=dev   # produção
npm audit              # completo
```

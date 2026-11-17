# Linguagem ubíqua

Termos do domínio da oficina e onde aparecem no código. Este glossário é o mesmo do [board do Miro](https://miro.com/app/board/uXjVETvEsw4=/).

| # | Termo | Significado | No código | Fonte |
| --- | --- | --- | --- | --- |
| 1 | Ordem de Serviço (OS) | Atendimento de um veículo, do recebimento à entrega | `OrdemServico`, `numero` | Enunciado |
| 2 | Cliente | Quem leva o veículo; identificado por CPF ou CNPJ e cadastrado com e-mail | `Cliente`, `documento`, `email` | Enunciado e código |
| 3 | Veículo | Veículo do cliente: placa, marca, modelo e ano | `Veiculo` | Enunciado |
| 4 | Serviço | Trabalho oferecido pela oficina (troca de óleo, alinhamento), com preço e materiais necessários | `Servico`, `MaterialNecessario` | Enunciado |
| 5 | Material | Peça ou insumo. O enunciado usa peças e insumos; o nome Material é decisão do projeto | `Material` | Enunciado e decisão do projeto |
| 6 | Estoque | Quantidade disponível de um Material | `estoque`, `removeEstoque`, `addEstoque` | Código |
| 7 | Item de serviço e item de material | O serviço ou o material já dentro da OS, com nome e preço guardados nela | `ItemServico`, `ItemMaterial` | Código |
| 8 | Orçamento | Valor total (serviços e materiais) registrado quando a OS passa para Aguardando aprovação: Pendente, Aprovado ou Rejeitado. Ao enviar, o cliente recebe o orçamento por e-mail | `Orcamento`, `StatusOrcamento` | Enunciado e código |
| 9 | Status da OS | Em ordem: Recebida, Em diagnóstico, Aguardando aprovação, Em execução, Finalizada, Entregue | `StatusOrdemServico` (`DIAGNOSTICO`, `EXECUCAO` etc.) | Enunciado |
| 10 | Comandos da OS | Iniciar diagnóstico, incluir serviço, incluir material, enviar orçamento, reenviar orçamento, aprovar orçamento, rejeitar orçamento, finalizar, entregar | `iniciarDiagnostico`, `incluirServico`, `incluirMaterial`, `enviarOrcamento`, `reenviarOrcamento`, `aprovarOrcamento`, `rejeitarOrcamento`, `finalizar`, `entregar` | Código |
| 11 | Objetos de valor | Dinheiro, Documento e Placa | `src/shared/domain` | Código |
| 12 | Comandos dos cadastros | Cadastrar, editar e excluir cliente, veículo, serviço e material | Casos de uso `Create`, `Update` e `Delete` de cada módulo; `update` e `delete` nas entidades | Enunciado e código |
| 13 | Exclusão | Soft delete: o registro sai das consultas e não entra em novas OS, mas fica no banco com a data da exclusão | `delete`, `deletedAt` | Decisão do projeto |
| 14 | Reativação | Cadastrar de novo um documento ou uma placa excluídos reaproveita o registro antigo | `CreateCliente`, `CreateVeiculo` | Decisão do projeto |
| 15 | Baixa de estoque | Na aprovação do orçamento, sai do estoque o que a OS usa: materiais avulsos e os dos serviços. Sem saldo, a aprovação é recusada | `AprovarOrcamento`, `materiaisNecessarios`, `removeEstoque` | Decisão do projeto |
| 16 | Reposição de estoque | Entrada de uma quantidade no estoque de um Material | `ReporEstoque`, `addEstoque` | Decisão do projeto |
| 17 | Tempo médio de execução | Média, em minutos, entre o início da execução e a finalização das OS finalizadas | `GetTempoMedio`, `averageTempoExecucaoMinutos` | Enunciado e código |
| 18 | Consulta pública | O cliente acompanha as próprias OS informando documento e placa, sem login; a resposta traz o id de cada OS | `GET /public/ordens-servico`, `ListOrdensServicoPublic` | Enunciado e código |
| 19 | Número da OS | Número sequencial da OS, mostrado nas consultas e no e-mail do orçamento | `numero`, `atribuirNumero` | Código |
| 20 | Envio do orçamento por e-mail | Ao enviar ou reenviar, o cliente recebe por e-mail o veículo, os itens e o valor. Sem e-mail cadastrado ou com falha no envio, a API responde 502, mas a OS continua aguardando aprovação | `NotificarOrcamentoCliente`, `NotificadorOrcamento`, `SmtpNotificadorOrcamento` | Enunciado e decisão do projeto |
| 21 | Usuário | Membro da equipe da oficina com acesso às rotas administrativas; e-mail único e senha guardada com hash | `Usuario`, `UsuarioRepository` | Enunciado e código |
| 22 | Administrador | Primeiro usuário, criado na inicialização a partir de `ADMIN_NOME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`, se o e-mail ainda não existe | `CreateAdmin` | Decisão do projeto |
| 23 | Login | A equipe informa e-mail e senha e recebe um token JWT; com dados errados, a API responde 401 | `POST /auth/login`, `AuthenticateUsuario`, `AuthController` | Enunciado e código |
| 24 | Rotas da equipe | Cadastros e ordens de serviço; exigem o token no cabeçalho `Authorization: Bearer`, senão 401. Login e as rotas públicas do cliente ficam abertos | `JwtAuthGuard` | Enunciado e código |
| 25 | Resposta do cliente ao orçamento | O cliente aprova ou rejeita o orçamento sem login, pelo id da OS, informando documento e placa; se não forem da OS, a API responde 404. Aprovar e rejeitar seguem as mesmas regras da equipe | `POST /public/ordens-servico/:id/aprovar-orcamento` e `/rejeitar-orcamento`, `AprovarOrcamentoPublic`, `RejeitarOrcamentoPublic`, `EnsureOrdemServicoCliente` | Enunciado e código |

import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { Documento } from '../../../../shared/domain/documento'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { NotificacaoError } from '../../../../shared/domain/notificacao-error'
import { Placa } from '../../../../shared/domain/placa'
import { InMemoryClienteRepository } from '../../../clientes/__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../../clientes/domain/cliente'
import { InMemoryVeiculoRepository } from '../../../veiculos/__test__/double/in-memory-veiculo.repository'
import { Veiculo } from '../../../veiculos/domain/veiculo'
import { InMemoryNotificadorOrcamento } from '../../__test__/double/in-memory-notificador-orcamento'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { ItemServico } from '../../domain/item-servico'
import { OrdemServico } from '../../domain/ordem-servico'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'
import { EnviarOrcamento } from '../enviar-orcamento.use-case'
import { NotificarOrcamentoCliente } from '../notificar-orcamento-cliente'

const veiculoId = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const servicoId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
const documento = Documento.create('52998224725')

describe('EnviarOrcamento', () => {
  let repository: InMemoryOrdemServicoRepository
  let clienteRepository: InMemoryClienteRepository
  let notificador: InMemoryNotificadorOrcamento
  let enviarOrcamento: EnviarOrcamento

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()
    clienteRepository = new InMemoryClienteRepository()
    const veiculoRepository = new InMemoryVeiculoRepository()
    await veiculoRepository.save(
      Veiculo.restore(veiculoId, Placa.create('ABC1D23'), 2018, 'Fiat', 'Uno', null, null),
    )
    notificador = new InMemoryNotificadorOrcamento()
    enviarOrcamento = new EnviarOrcamento(
      repository,
      new NotificarOrcamentoCliente(clienteRepository, veiculoRepository, notificador),
    )
  })

  async function ordemEmDiagnostico(cliente: Cliente): Promise<OrdemServico> {
    await clienteRepository.save(cliente)
    const ordem = OrdemServico.create(cliente.id, veiculoId)
    ordem.incluirServico(ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150)))
    ordem.iniciarDiagnostico()
    await repository.save(ordem)
    return ordem
  }

  it('gera o orçamento com o total da ordem, aguarda aprovação, salva e avisa o cliente', async () => {
    const ordem = await ordemEmDiagnostico(
      Cliente.create(documento, 'Maria Silva', 'maria@email.com'),
    )
    const save = vi.spyOn(repository, 'save')

    await enviarOrcamento.execute({ ordemServicoId: ordem.id })

    expect(ordem.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO)
    expect(ordem.orcamentos.map((orcamento) => orcamento.valor.reais)).toEqual([150])
    expect(save).toHaveBeenCalledWith(ordem)
    expect(notificador.notificacoes).toEqual([
      {
        email: 'maria@email.com',
        nome: 'Maria Silva',
        numero: 1,
        veiculo: { placa: 'ABC1D23', marca: 'Fiat', modelo: 'Uno', ano: 2018 },
        servicos: [{ nome: 'Troca de óleo', preco: Dinheiro.fromReais(150) }],
        materiais: [],
        valor: Dinheiro.fromReais(150),
      },
    ])
  })

  it('mantém a ordem aguardando aprovação quando o e-mail falha', async () => {
    const ordem = await ordemEmDiagnostico(
      Cliente.create(documento, 'Maria Silva', 'maria@email.com'),
    )
    notificador.falhando = true

    await expect(enviarOrcamento.execute({ ordemServicoId: ordem.id })).rejects.toThrow(
      NotificacaoError,
    )

    expect(ordem.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO)
  })

  it('mantém a ordem aguardando aprovação quando o cliente não tem e-mail', async () => {
    const ordem = await ordemEmDiagnostico(
      Cliente.restore('1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', documento, 'Maria Silva', null, null),
    )

    await expect(enviarOrcamento.execute({ ordemServicoId: ordem.id })).rejects.toThrow(
      NotificacaoError,
    )

    expect(ordem.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO)
    expect(notificador.notificacoes).toEqual([])
  })

  it('rejeita ordem inexistente', async () => {
    await expect(
      enviarOrcamento.execute({ ordemServicoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

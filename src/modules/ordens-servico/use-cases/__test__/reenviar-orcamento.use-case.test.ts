import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { Documento } from '../../../../shared/domain/documento'
import { DomainError } from '../../../../shared/domain/domain-error'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
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
import { NotificarOrcamentoCliente } from '../notificar-orcamento-cliente'
import { ReenviarOrcamento } from '../reenviar-orcamento.use-case'

const veiculoId = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const servicoId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'

describe('ReenviarOrcamento', () => {
  let repository: InMemoryOrdemServicoRepository
  let clienteRepository: InMemoryClienteRepository
  let notificador: InMemoryNotificadorOrcamento
  let reenviarOrcamento: ReenviarOrcamento
  let cliente: Cliente

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()
    clienteRepository = new InMemoryClienteRepository()
    const veiculoRepository = new InMemoryVeiculoRepository()
    await veiculoRepository.save(
      Veiculo.restore(veiculoId, Placa.create('ABC1D23'), 2018, 'Fiat', 'Uno', null, null),
    )
    notificador = new InMemoryNotificadorOrcamento()
    reenviarOrcamento = new ReenviarOrcamento(
      repository,
      new NotificarOrcamentoCliente(clienteRepository, veiculoRepository, notificador),
    )
    cliente = Cliente.create(Documento.create('52998224725'), 'Maria Silva', 'maria@email.com')
    await clienteRepository.save(cliente)
  })

  function ordemComItem(): OrdemServico {
    const ordem = OrdemServico.create(cliente.id, veiculoId)
    ordem.incluirServico(ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150)))
    ordem.iniciarDiagnostico()
    return ordem
  }

  it('envia de novo o orçamento vigente sem mudar o status da ordem', async () => {
    const ordem = ordemComItem()
    ordem.enviarOrcamento()
    await repository.save(ordem)

    await reenviarOrcamento.execute({ ordemServicoId: ordem.id })

    expect(ordem.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO)
    expect(notificador.notificacoes.map((notificacao) => notificacao.valor.reais)).toEqual([150])
  })

  it('rejeita ordem que não aguarda aprovação', async () => {
    const ordem = ordemComItem()
    await repository.save(ordem)

    await expect(reenviarOrcamento.execute({ ordemServicoId: ordem.id })).rejects.toThrow(
      DomainError,
    )
  })

  it('rejeita ordem inexistente', async () => {
    await expect(
      reenviarOrcamento.execute({ ordemServicoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

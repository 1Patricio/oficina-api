import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { Documento } from '../../../../shared/domain/documento'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { Placa } from '../../../../shared/domain/placa'
import { InMemoryClienteRepository } from '../../../clientes/__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../../clientes/domain/cliente'
import { InMemoryVeiculoRepository } from '../../../veiculos/__test__/double/in-memory-veiculo.repository'
import { Veiculo } from '../../../veiculos/domain/veiculo'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { ItemServico } from '../../domain/item-servico'
import { OrdemServico } from '../../domain/ordem-servico'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'
import { EnsureOrdemServicoCliente } from '../ensure-ordem-servico-cliente'
import { RejeitarOrcamento } from '../rejeitar-orcamento.use-case'
import { RejeitarOrcamentoPublic } from '../rejeitar-orcamento-public.use-case'

const servicoId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'

describe('RejeitarOrcamentoPublic', () => {
  let ordem: OrdemServico
  let rejeitarOrcamentoPublic: RejeitarOrcamentoPublic

  beforeEach(async () => {
    const clienteRepository = new InMemoryClienteRepository()
    const veiculoRepository = new InMemoryVeiculoRepository()
    const ordemServicoRepository = new InMemoryOrdemServicoRepository()

    const maria = Cliente.create(
      Documento.create('529.982.247-25'),
      'Maria Silva',
      'maria@email.com',
    )
    const joao = Cliente.create(Documento.create('111.444.777-35'), 'João Souza', 'joao@email.com')

    await clienteRepository.save(maria)
    await clienteRepository.save(joao)

    const gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol', maria.id)
    await veiculoRepository.save(gol)

    ordem = OrdemServico.create(maria.id, gol.id)
    ordem.incluirServico(ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150)))
    ordem.iniciarDiagnostico()
    ordem.enviarOrcamento()
    await ordemServicoRepository.save(ordem)

    rejeitarOrcamentoPublic = new RejeitarOrcamentoPublic(
      new EnsureOrdemServicoCliente(clienteRepository, veiculoRepository, ordemServicoRepository),
      new RejeitarOrcamento(ordemServicoRepository),
    )
  })

  it('rejeita o orçamento da ordem do cliente', async () => {
    await rejeitarOrcamentoPublic.execute({
      ordemServicoId: ordem.id,
      documento: '529.982.247-25',
      placa: 'ABC1234',
    })

    expect(ordem.status).toBe(StatusOrdemServico.DIAGNOSTICO)
  })

  it('não rejeita a ordem com o documento de outro cliente', async () => {
    await expect(
      rejeitarOrcamentoPublic.execute({
        ordemServicoId: ordem.id,
        documento: '111.444.777-35',
        placa: 'ABC1234',
      }),
    ).rejects.toThrow(NotFoundError)

    expect(ordem.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO)
  })
})

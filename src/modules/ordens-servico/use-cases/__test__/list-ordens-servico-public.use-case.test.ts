import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { Documento } from '../../../../shared/domain/documento'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { Placa } from '../../../../shared/domain/placa'
import { InMemoryClienteRepository } from '../../../clientes/__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../../clientes/domain/cliente'
import { InMemoryVeiculoRepository } from '../../../veiculos/__test__/double/in-memory-veiculo.repository'
import { Veiculo } from '../../../veiculos/domain/veiculo'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { ItemMaterial } from '../../domain/item-material'
import { ItemServico } from '../../domain/item-servico'
import { OrdemServico } from '../../domain/ordem-servico'
import { StatusOrcamento } from '../../domain/status-orcamento'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'
import { ListOrdensServicoPublic } from '../list-ordens-servico-public.use-case'

const servicoId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
const materialId = '9c858901-8a57-4791-81fe-4c455b099bc9'

describe('ListOrdensServicoPublic', () => {
  let repository: InMemoryOrdemServicoRepository
  let listOrdensServicoPublic: ListOrdensServicoPublic
  let maria: Cliente
  let joao: Cliente
  let gol: Veiculo

  const consulta = { documento: '529.982.247-25', placa: 'ABC1234', page: 1, rpp: 20 }

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()
    const clienteRepository = new InMemoryClienteRepository()
    const veiculoRepository = new InMemoryVeiculoRepository()
    listOrdensServicoPublic = new ListOrdensServicoPublic(
      repository,
      clienteRepository,
      veiculoRepository,
    )

    maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva', 'maria@email.com')
    await clienteRepository.save(maria)
    joao = Cliente.create(Documento.create('111.444.777-35'), 'João Souza', 'joao@email.com')
    await clienteRepository.save(joao)
    gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol', maria.id)
    await veiculoRepository.save(gol)
  })

  it('devolve a ordem com itens, orçamento e valores em reais, sem ids internos', async () => {
    const ordem = OrdemServico.create(maria.id, gol.id, new Date('2026-10-01T10:00:00Z'))
    ordem.incluirServico(ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150)))
    ordem.incluirMaterial(
      ItemMaterial.create(materialId, 'Filtro de óleo', Dinheiro.fromReais(25), 2),
    )
    ordem.iniciarDiagnostico()
    ordem.enviarOrcamento(new Date('2026-10-02T10:00:00Z'))
    await repository.save(ordem)

    const ordens = await listOrdensServicoPublic.execute(consulta)

    expect(ordens.list).toEqual([
      {
        id: ordem.id,
        status: StatusOrdemServico.AGUARDANDO_APROVACAO,
        dataRecebimento: new Date('2026-10-01T10:00:00Z'),
        dataInicio: null,
        dataFinalizacao: null,
        dataEntrega: null,
        servicos: [{ nome: 'Troca de óleo', preco: 150 }],
        materiais: [{ nome: 'Filtro de óleo', precoUnitario: 25, quantidade: 2, subtotal: 50 }],
        orcamentos: [
          {
            valor: 200,
            status: StatusOrcamento.PENDENTE,
            dataEnvio: new Date('2026-10-02T10:00:00Z'),
            dataResposta: null,
          },
        ],
        total: 200,
      },
    ])
  })

  it('lista a ordem mais recente primeiro', async () => {
    const antiga = OrdemServico.create(maria.id, gol.id, new Date('2026-09-01T10:00:00Z'))
    const recente = OrdemServico.create(maria.id, gol.id, new Date('2026-10-01T10:00:00Z'))
    await repository.save(antiga)
    await repository.save(recente)

    const ordens = await listOrdensServicoPublic.execute(consulta)

    expect(ordens.list.map((ordem) => ordem.id)).toEqual([recente.id, antiga.id])
  })

  it('não mostra as ordens do veículo feitas para outro cliente', async () => {
    const ordemJoao = OrdemServico.create(joao.id, gol.id)
    const ordemMaria = OrdemServico.create(maria.id, gol.id)
    await repository.save(ordemJoao)
    await repository.save(ordemMaria)

    const ordens = await listOrdensServicoPublic.execute(consulta)

    expect(ordens.list.map((ordem) => ordem.id)).toEqual([ordemMaria.id])
  })

  it('rejeita documento sem cliente', async () => {
    await repository.save(OrdemServico.create(maria.id, gol.id))

    await expect(
      listOrdensServicoPublic.execute({ ...consulta, documento: '123.456.789-09' }),
    ).rejects.toThrow(NotFoundError)
  })

  it('rejeita documento e placa que não têm ordem juntos', async () => {
    await repository.save(OrdemServico.create(maria.id, gol.id))

    await expect(
      listOrdensServicoPublic.execute({ ...consulta, documento: '111.444.777-35' }),
    ).rejects.toThrow(NotFoundError)
  })
})

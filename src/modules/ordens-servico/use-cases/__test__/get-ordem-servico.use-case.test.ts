import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { ItemMaterial } from '../../domain/item-material'
import { ItemServico } from '../../domain/item-servico'
import { OrdemServico } from '../../domain/ordem-servico'
import { StatusOrcamento } from '../../domain/status-orcamento'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'
import { GetOrdemServico } from '../get-ordem-servico.use-case'

const clienteId = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const veiculoId = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const servicoId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
const materialId = '9c858901-8a57-4791-81fe-4c455b099bc9'

describe('GetOrdemServico', () => {
  let repository: InMemoryOrdemServicoRepository
  let getOrdemServico: GetOrdemServico

  beforeEach(() => {
    repository = new InMemoryOrdemServicoRepository()
    getOrdemServico = new GetOrdemServico(repository)
  })

  it('devolve a ordem com itens, orçamento e valores em reais', async () => {
    const ordem = OrdemServico.create(clienteId, veiculoId, new Date('2026-10-01T10:00:00Z'))
    ordem.incluirServico(ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150)))
    ordem.incluirMaterial(
      ItemMaterial.create(materialId, 'Filtro de óleo', Dinheiro.fromReais(25), 2),
    )
    ordem.iniciarDiagnostico()
    ordem.enviarOrcamento(new Date('2026-10-02T10:00:00Z'))
    await repository.save(ordem)

    const detalhe = await getOrdemServico.execute({ ordemServicoId: ordem.id })

    expect(detalhe).toEqual({
      id: ordem.id,
      clienteId,
      veiculoId,
      status: StatusOrdemServico.AGUARDANDO_APROVACAO,
      dataRecebimento: new Date('2026-10-01T10:00:00Z'),
      dataInicio: null,
      dataFinalizacao: null,
      dataEntrega: null,
      servicos: [{ servicoId, nome: 'Troca de óleo', preco: 150 }],
      materiais: [
        { materialId, nome: 'Filtro de óleo', precoUnitario: 25, quantidade: 2, subtotal: 50 },
      ],
      orcamentos: [
        {
          valor: 200,
          status: StatusOrcamento.PENDENTE,
          dataEnvio: new Date('2026-10-02T10:00:00Z'),
          dataResposta: null,
        },
      ],
      total: 200,
    })
  })

  it('rejeita ordem inexistente', async () => {
    await expect(
      getOrdemServico.execute({ ordemServicoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

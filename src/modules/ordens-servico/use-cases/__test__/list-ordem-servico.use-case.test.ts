import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { ItemServico } from '../../domain/item-servico'
import { OrdemServico } from '../../domain/ordem-servico'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'
import { ListOrdemServico } from '../list-ordem-servico.use-case'

const clienteId = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const veiculoId = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const servicoId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'

describe('ListOrdemServico', () => {
  let repository: InMemoryOrdemServicoRepository
  let listOrdemServico: ListOrdemServico

  beforeEach(() => {
    repository = new InMemoryOrdemServicoRepository()
    listOrdemServico = new ListOrdemServico(repository)
  })

  it('lista a página de ordens com o resumo e o total em reais', async () => {
    const ordem = OrdemServico.create(clienteId, veiculoId, new Date('2026-10-01T10:00:00Z'))
    ordem.incluirServico(ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150)))
    await repository.save(ordem)

    const ordens = await listOrdemServico.execute({ page: 1, rpp: 20 })

    expect(ordens).toMatchObject({
      page: 1,
      rpp: 20,
      more: false,
      list: [
        {
          id: ordem.id,
          clienteId,
          veiculoId,
          status: StatusOrdemServico.RECEBIDA,
          dataRecebimento: new Date('2026-10-01T10:00:00Z'),
          total: 150,
        },
      ],
    })
  })

  it('filtra as ordens pelo status', async () => {
    const recebida = OrdemServico.create(clienteId, veiculoId)
    const emDiagnostico = OrdemServico.create(clienteId, veiculoId)
    emDiagnostico.iniciarDiagnostico()
    await repository.save(recebida)
    await repository.save(emDiagnostico)

    const ordens = await listOrdemServico.execute({
      page: 1,
      rpp: 20,
      status: StatusOrdemServico.DIAGNOSTICO,
    })

    expect(ordens.list.map((ordem) => ordem.id)).toEqual([emDiagnostico.id])
  })
})

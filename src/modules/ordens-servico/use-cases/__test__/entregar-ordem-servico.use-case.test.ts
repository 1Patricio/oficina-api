import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { ItemServico } from '../../domain/item-servico'
import { OrdemServico } from '../../domain/ordem-servico'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'
import { EntregarOrdemServico } from '../entregar-ordem-servico.use-case'

const clienteId = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const veiculoId = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const servicoId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'

describe('EntregarOrdemServico', () => {
  let repository: InMemoryOrdemServicoRepository
  let entregarOrdemServico: EntregarOrdemServico

  beforeEach(() => {
    repository = new InMemoryOrdemServicoRepository()
    entregarOrdemServico = new EntregarOrdemServico(repository)
  })

  it('entrega a ordem finalizada e salva', async () => {
    const ordem = OrdemServico.create(clienteId, veiculoId)
    ordem.incluirServico(ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150)))
    ordem.iniciarDiagnostico()
    ordem.enviarOrcamento()
    ordem.aprovarOrcamento()
    ordem.finalizar()
    await repository.save(ordem)
    const save = vi.spyOn(repository, 'save')

    await entregarOrdemServico.execute({ ordemServicoId: ordem.id })

    expect(ordem.status).toBe(StatusOrdemServico.ENTREGUE)
    expect(save).toHaveBeenCalledWith(ordem)
  })

  it('rejeita ordem inexistente', async () => {
    await expect(
      entregarOrdemServico.execute({ ordemServicoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

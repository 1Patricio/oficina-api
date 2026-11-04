import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryServicoRepository } from '../../__test__/double/in-memory-servico.repository'
import { Servico } from '../../domain/servico'
import { DeleteServico } from '../delete-servico.use-case'

describe('DeleteServico', () => {
  let repository: InMemoryServicoRepository
  let deleteServico: DeleteServico

  beforeEach(() => {
    repository = new InMemoryServicoRepository()
    deleteServico = new DeleteServico(repository)
  })

  it('marca o serviço como excluído sem apagar o registro', async () => {
    const trocaOleo = Servico.create(
      'Troca de óleo',
      'Troca com 1L de óleo',
      Dinheiro.fromCents(15000),
    )

    await repository.save(trocaOleo)

    await deleteServico.execute({ servicoId: trocaOleo.id })

    expect(repository.servicos[0]?.deletedAt).toBeInstanceOf(Date)
  })

  it('rejeita serviço inexistente', async () => {
    await expect(
      deleteServico.execute({ servicoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

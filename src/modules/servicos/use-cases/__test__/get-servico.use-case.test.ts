import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryServicoRepository } from '../../__test__/double/in-memory-servico.repository'
import { MaterialNecessario } from '../../domain/material-necessario'
import { Servico } from '../../domain/servico'
import { GetServico } from '../get-servico.use-case'

describe('GetServico', () => {
  let repository: InMemoryServicoRepository
  let getServico: GetServico

  beforeEach(() => {
    repository = new InMemoryServicoRepository()
    getServico = new GetServico(repository)
  })

  it('devolve o serviço com o preço em reais e os materiais necessários', async () => {
    const materialId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
    const troca = Servico.create(
      'Troca de óleo',
      'Troca com 1L de óleo',
      Dinheiro.fromCents(15000),
      [MaterialNecessario.create(materialId, 1)],
    )
    await repository.save(troca)

    const servico = await getServico.execute({ servicoId: troca.id })

    expect(servico).toEqual({
      id: troca.id,
      nome: 'Troca de óleo',
      descricao: 'Troca com 1L de óleo',
      preco: 150,
      materiais: [{ materialId, quantidade: 1 }],
    })
  })

  it('rejeita serviço inexistente', async () => {
    await expect(
      getServico.execute({ servicoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

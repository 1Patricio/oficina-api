import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { InMemoryServicoRepository } from '../../__test__/double/in-memory-servico.repository'
import { MaterialNecessario } from '../../domain/material-necessario'
import { Servico } from '../../domain/servico'
import { ListServicos } from '../list-servicos.use-case'

describe('ListServicos', () => {
  it('lista a página de serviços com o preço em reais e os materiais necessários', async () => {
    const repository = new InMemoryServicoRepository()
    const materialId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
    const troca = Servico.create(
      'Troca de óleo',
      'Troca com 1L de óleo',
      Dinheiro.fromCents(15000),
      [MaterialNecessario.create(materialId, 1)],
    )
    await repository.save(troca)

    const servicos = await new ListServicos(repository).execute({ page: 1, rpp: 20 })

    expect(servicos).toMatchObject({
      page: 1,
      rpp: 20,
      more: false,
      list: [
        {
          id: troca.id,
          nome: 'Troca de óleo',
          descricao: 'Troca com 1L de óleo',
          preco: 150,
          materiais: [{ materialId, quantidade: 1 }],
        },
      ],
    })
  })
})

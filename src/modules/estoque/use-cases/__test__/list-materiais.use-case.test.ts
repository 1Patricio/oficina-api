import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { InMemoryMaterialRepository } from '../../__test__/double/in-memory-material.repository'
import { Material } from '../../domain/material'
import { ListMateriais } from '../list-materiais.use-case'

describe('ListMateriais', () => {
  it('lista a página de materiais com o preço unitário em reais', async () => {
    const repository = new InMemoryMaterialRepository()
    const filtro = Material.create('Filtro de óleo', Dinheiro.fromCents(4590), 10)
    await repository.save(filtro)

    const materiais = await new ListMateriais(repository).execute({ page: 1, rpp: 20 })

    expect(materiais).toMatchObject({
      page: 1,
      rpp: 20,
      more: false,
      list: [{ id: filtro.id, nome: 'Filtro de óleo', precoUnitario: 45.9, estoque: 10 }],
    })
  })
})

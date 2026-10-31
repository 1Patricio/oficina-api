import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryMaterialRepository } from '../../__test__/double/in-memory-material.repository'
import { Material } from '../../domain/material'
import { GetMaterial } from '../get-material.use-case'

describe('GetMaterial', () => {
  let repository: InMemoryMaterialRepository
  let getMaterial: GetMaterial

  beforeEach(() => {
    repository = new InMemoryMaterialRepository()
    getMaterial = new GetMaterial(repository)
  })

  it('devolve o material com o preço em reais', async () => {
    const filtro = Material.create('Filtro de óleo', Dinheiro.fromCents(4590), 10)

    await repository.save(filtro)

    const material = await getMaterial.execute({ materialId: filtro.id })

    expect(material).toEqual({
      id: filtro.id,
      nome: 'Filtro de óleo',
      precoUnitario: 45.9,
      estoque: 10,
    })
  })

  it('rejeita material inexistente', async () => {
    await expect(
      getMaterial.execute({ materialId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

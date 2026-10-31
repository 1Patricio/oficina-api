import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryMaterialRepository } from '../../__test__/double/in-memory-material.repository'
import { Material } from '../../domain/material'
import { UpdateMaterial } from '../update-material.use-case'

describe('UpdateMaterial', () => {
  let repository: InMemoryMaterialRepository
  let updateMaterial: UpdateMaterial

  beforeEach(() => {
    repository = new InMemoryMaterialRepository()
    updateMaterial = new UpdateMaterial(repository)
  })

  it('salva o material com os dados informados e o preço em centavos', async () => {
    const filtro = Material.create('Filtro de óleo', Dinheiro.fromCents(4590), 10)

    await repository.save(filtro)

    await updateMaterial.execute({
      materialId: filtro.id,
      nome: 'Filtro de ar',
      precoUnitario: 52.9,
      estoque: 3,
    })

    const salvo = await repository.findById(filtro.id)

    expect(salvo?.nome).toBe('Filtro de ar')
    expect(salvo?.precoUnitario.cents).toBe(5290)
    expect(salvo?.estoque).toBe(3)
  })

  it('rejeita material inexistente', async () => {
    await expect(
      updateMaterial.execute({
        materialId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d',
        nome: 'Filtro de ar',
        precoUnitario: 52.9,
        estoque: 3,
      }),
    ).rejects.toThrow(NotFoundError)
  })
})

import { ConflictError } from '../../../../shared/domain/conflict-error'
import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryMaterialRepository } from '../../__test__/double/in-memory-material.repository'
import { Material } from '../../domain/material'
import { DeleteMaterial } from '../delete-material.use-case'

describe('DeleteMaterial', () => {
  let repository: InMemoryMaterialRepository
  let deleteMaterial: DeleteMaterial
  let filtro: Material

  beforeEach(async () => {
    repository = new InMemoryMaterialRepository()
    deleteMaterial = new DeleteMaterial(repository)

    filtro = Material.create('Filtro de óleo', Dinheiro.fromCents(4590), 10)

    await repository.save(filtro)
  })

  it('marca o material como excluído sem apagar o registro', async () => {
    await deleteMaterial.execute({ materialId: filtro.id })

    expect(repository.materiais[0]?.deletedAt).toBeInstanceOf(Date)
  })

  it('rejeita material vinculado a serviços sem excluir', async () => {
    repository.usadosEmServico.add(filtro.id)

    await expect(deleteMaterial.execute({ materialId: filtro.id })).rejects.toThrow(ConflictError)
    expect(filtro.deletedAt).toBeNull()
  })

  it('rejeita material inexistente', async () => {
    await expect(
      deleteMaterial.execute({ materialId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

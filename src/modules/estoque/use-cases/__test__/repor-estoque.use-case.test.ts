import { InMemoryTransactionManager } from '../../../../shared/__test__/double/in-memory-transaction-manager'
import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryMaterialRepository } from '../../__test__/double/in-memory-material.repository'
import { Material } from '../../domain/material'
import { ReporEstoque } from '../repor-estoque.use-case'

describe('ReporEstoque', () => {
  let repository: InMemoryMaterialRepository
  let transactionManager: InMemoryTransactionManager
  let reporEstoque: ReporEstoque

  beforeEach(() => {
    repository = new InMemoryMaterialRepository()
    transactionManager = new InMemoryTransactionManager()
    reporEstoque = new ReporEstoque(repository, transactionManager)
  })

  it('soma a quantidade ao estoque e salva em uma transação', async () => {
    const filtro = Material.create('Filtro de óleo', Dinheiro.fromCents(4590), 10)
    await repository.save(filtro)
    const save = vi.spyOn(repository, 'save')
    const runInTransaction = vi.spyOn(transactionManager, 'runInTransaction')

    await reporEstoque.execute({ materialId: filtro.id, quantidade: 5 })

    expect(filtro.estoque).toBe(15)
    expect(save).toHaveBeenCalledWith(filtro)
    expect(runInTransaction).toHaveBeenCalledOnce()
  })

  it('rejeita material inexistente', async () => {
    await expect(
      reporEstoque.execute({
        materialId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d',
        quantidade: 5,
      }),
    ).rejects.toThrow(NotFoundError)
  })
})

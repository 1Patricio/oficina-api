import { InMemoryTransactionManager } from '../../../../shared/__test__/double/in-memory-transaction-manager'
import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { DomainError } from '../../../../shared/domain/domain-error'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryMaterialRepository } from '../../../estoque/__test__/double/in-memory-material.repository'
import { Material } from '../../../estoque/domain/material'
import { MaterialNecessario } from '../../../servicos/domain/material-necessario'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { ItemMaterial } from '../../domain/item-material'
import { ItemServico } from '../../domain/item-servico'
import { OrdemServico } from '../../domain/ordem-servico'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'
import { AprovarOrcamento } from '../aprovar-orcamento.use-case'

const clienteId = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const veiculoId = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const servicoId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'

function ordemComOrcamento(oleo: Material, filtro: Material): OrdemServico {
  const ordem = OrdemServico.create(clienteId, veiculoId)
  ordem.incluirServico(
    ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150), [
      MaterialNecessario.create(oleo.id, 4),
    ]),
  )
  ordem.incluirMaterial(ItemMaterial.create(filtro.id, filtro.nome, filtro.precoUnitario, 2))
  ordem.iniciarDiagnostico()
  ordem.enviarOrcamento()
  return ordem
}

describe('AprovarOrcamento', () => {
  let repository: InMemoryOrdemServicoRepository
  let materialRepository: InMemoryMaterialRepository
  let transactionManager: InMemoryTransactionManager
  let aprovarOrcamento: AprovarOrcamento
  let oleo: Material
  let filtro: Material

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()
    materialRepository = new InMemoryMaterialRepository()
    transactionManager = new InMemoryTransactionManager()
    aprovarOrcamento = new AprovarOrcamento(repository, materialRepository, transactionManager)

    oleo = Material.create('Óleo 5W30', Dinheiro.fromReais(35), 10)
    filtro = Material.create('Filtro de óleo', Dinheiro.fromReais(20), 5)
    await materialRepository.save(oleo)
    await materialRepository.save(filtro)
  })

  it('aprova, baixa o estoque e salva a ordem em uma transação', async () => {
    const ordem = ordemComOrcamento(oleo, filtro)
    await repository.save(ordem)
    const save = vi.spyOn(repository, 'save')
    const runInTransaction = vi.spyOn(transactionManager, 'runInTransaction')

    await aprovarOrcamento.execute({ ordemServicoId: ordem.id })

    expect(ordem.status).toBe(StatusOrdemServico.EXECUCAO)
    expect(oleo.estoque).toBe(6)
    expect(filtro.estoque).toBe(3)
    expect(save).toHaveBeenCalledWith(ordem)
    expect(runInTransaction).toHaveBeenCalledOnce()
  })

  it('rejeita aprovar sem estoque suficiente e não salva a ordem', async () => {
    const ordem = ordemComOrcamento(oleo, filtro)
    await repository.save(ordem)
    oleo.removeEstoque(8)
    const save = vi.spyOn(repository, 'save')

    await expect(aprovarOrcamento.execute({ ordemServicoId: ordem.id })).rejects.toThrow(
      DomainError,
    )

    expect(save).not.toHaveBeenCalled()
  })

  it('rejeita aprovar com material que não existe mais', async () => {
    const ordem = ordemComOrcamento(oleo, filtro)
    await repository.save(ordem)
    filtro.delete()

    await expect(aprovarOrcamento.execute({ ordemServicoId: ordem.id })).rejects.toThrow(
      NotFoundError,
    )
  })

  it('rejeita ordem inexistente', async () => {
    await expect(aprovarOrcamento.execute({ ordemServicoId: servicoId })).rejects.toThrow(
      NotFoundError,
    )
  })
})

import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryMaterialRepository } from '../../../estoque/__test__/double/in-memory-material.repository'
import { Material } from '../../../estoque/domain/material'
import { InMemoryServicoRepository } from '../../../servicos/__test__/double/in-memory-servico.repository'
import { Servico } from '../../../servicos/domain/servico'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { OrdemServico } from '../../domain/ordem-servico'
import { IncluirItens } from '../incluir-itens.use-case'

const clienteId = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const veiculoId = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const idInexistente = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'

describe('IncluirItens', () => {
  let repository: InMemoryOrdemServicoRepository
  let servicoRepository: InMemoryServicoRepository
  let materialRepository: InMemoryMaterialRepository
  let incluirItens: IncluirItens
  let ordem: OrdemServico

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()
    servicoRepository = new InMemoryServicoRepository()
    materialRepository = new InMemoryMaterialRepository()
    incluirItens = new IncluirItens(repository, servicoRepository, materialRepository)

    ordem = OrdemServico.create(clienteId, veiculoId)
    ordem.iniciarDiagnostico()
    await repository.save(ordem)
  })

  it('inclui serviços e materiais com o preço do catálogo e salva', async () => {
    const troca = Servico.create('Troca de óleo', 'Com 1L de óleo', Dinheiro.fromReais(150))
    await servicoRepository.save(troca)
    const filtro = Material.create('Filtro de óleo', Dinheiro.fromReais(25), 10)
    await materialRepository.save(filtro)
    const save = vi.spyOn(repository, 'save')

    await incluirItens.execute({
      ordemServicoId: ordem.id,
      servicoIds: [troca.id],
      materiais: [{ materialId: filtro.id, quantidade: 2 }],
    })

    expect(ordem.total.reais).toBe(200)
    expect(save).toHaveBeenCalledWith(ordem)
  })

  it('rejeita ordem inexistente', async () => {
    await expect(incluirItens.execute({ ordemServicoId: idInexistente })).rejects.toThrow(
      NotFoundError,
    )
  })

  it('rejeita serviço inexistente', async () => {
    await expect(
      incluirItens.execute({ ordemServicoId: ordem.id, servicoIds: [idInexistente] }),
    ).rejects.toThrow(NotFoundError)
  })

  it('rejeita material inexistente', async () => {
    await expect(
      incluirItens.execute({
        ordemServicoId: ordem.id,
        materiais: [{ materialId: idInexistente, quantidade: 1 }],
      }),
    ).rejects.toThrow(NotFoundError)
  })
})

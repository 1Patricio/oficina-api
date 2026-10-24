import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { DomainError } from '../../../../shared/domain/domain-error'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryMaterialRepository } from '../../../estoque/__test__/double/in-memory-material.repository'
import { Material } from '../../../estoque/domain/material'
import { InMemoryServicoRepository } from '../../__test__/double/in-memory-servico.repository'
import { CreateServico } from '../create-servico.use-case'

const fakeServico = {
  nome: 'Troca de óleo',
  descricao: 'Troca de óleo com 1L de óleo',
  preco: 150,
}

describe('CreateServico', () => {
  let servicoRepository: InMemoryServicoRepository
  let materialRepository: InMemoryMaterialRepository
  let createServico: CreateServico

  beforeEach(() => {
    servicoRepository = new InMemoryServicoRepository()
    materialRepository = new InMemoryMaterialRepository()
    createServico = new CreateServico(servicoRepository, materialRepository)
  })

  it('salva o serviço com os dados e os materiais informados e devolve o id', async () => {
    const oleo = Material.create('Óleo 5W30', Dinheiro.fromCents(3500), 10)
    await materialRepository.save(oleo)

    const { id } = await createServico.execute({
      ...fakeServico,
      materiais: [{ materialId: oleo.id, quantidade: 1 }],
    })

    const servico = await servicoRepository.findById(id)
    expect(servico?.nome).toBe('Troca de óleo')
    expect(servico?.preco.cents).toBe(15000)
    expect(servico?.materiais.map((material) => material.materialId)).toEqual([oleo.id])
  })

  it('rejeita dados inválidos sem salvar', async () => {
    await expect(createServico.execute({ ...fakeServico, nome: '  ' })).rejects.toThrow(DomainError)
    expect(servicoRepository.servicos).toHaveLength(0)
  })

  it('rejeita material inexistente sem salvar', async () => {
    const materiais = [{ materialId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d', quantidade: 1 }]

    await expect(createServico.execute({ ...fakeServico, materiais })).rejects.toThrow(
      NotFoundError,
    )
    expect(servicoRepository.servicos).toHaveLength(0)
  })
})

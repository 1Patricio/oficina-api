import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryMaterialRepository } from '../../../estoque/__test__/double/in-memory-material.repository'
import { Material } from '../../../estoque/domain/material'
import { InMemoryServicoRepository } from '../../__test__/double/in-memory-servico.repository'
import { Servico } from '../../domain/servico'
import { UpdateServico } from '../update-servico.use-case'

const fakeServico = {
  nome: 'Troca de óleo e filtro',
  descricao: 'Troca de óleo e filtro de óleo',
  preco: 180,
}

describe('UpdateServico', () => {
  let servicoRepository: InMemoryServicoRepository
  let materialRepository: InMemoryMaterialRepository
  let updateServico: UpdateServico
  let trocaOleo: Servico

  beforeEach(async () => {
    servicoRepository = new InMemoryServicoRepository()
    materialRepository = new InMemoryMaterialRepository()
    updateServico = new UpdateServico(servicoRepository, materialRepository)

    trocaOleo = Servico.create(
      'Troca de óleo',
      'Troca de óleo com 1L de óleo',
      Dinheiro.fromCents(15000),
    )

    await servicoRepository.save(trocaOleo)
  })

  it('salva o serviço com os dados e os materiais informados', async () => {
    const filtro = Material.create('Filtro de óleo', Dinheiro.fromCents(4590), 10)

    await materialRepository.save(filtro)

    await updateServico.execute({
      servicoId: trocaOleo.id,
      ...fakeServico,
      materiais: [{ materialId: filtro.id, quantidade: 1 }],
    })

    const salvo = await servicoRepository.findById(trocaOleo.id)

    expect(salvo?.nome).toBe('Troca de óleo e filtro')
    expect(salvo?.preco.cents).toBe(18000)
    expect(salvo?.materiais.map((material) => material.materialId)).toEqual([filtro.id])
  })

  it('rejeita material inexistente', async () => {
    const materiais = [{ materialId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d', quantidade: 1 }]

    await expect(
      updateServico.execute({ servicoId: trocaOleo.id, ...fakeServico, materiais }),
    ).rejects.toThrow(NotFoundError)
  })

  it('rejeita serviço inexistente', async () => {
    await expect(
      updateServico.execute({ servicoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d', ...fakeServico }),
    ).rejects.toThrow(NotFoundError)
  })
})

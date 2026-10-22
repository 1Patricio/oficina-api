import { DomainError } from '../../../../shared/domain/domain-error'
import { Material } from '../../domain/material'
import { MaterialRepository } from '../../domain/repositories/material.repository'
import { CreateMaterial } from '../create-material.use-case'

class InMemoryMaterialRepository extends MaterialRepository {
  readonly materiais: Material[] = []

  save(material: Material): Promise<void> {
    this.materiais.push(material)
    return Promise.resolve()
  }

  findById(id: string): Promise<Material | null> {
    const material = this.materiais.find((item) => item.id === id)
    return Promise.resolve(material ?? null)
  }

  list(): Promise<Material[]> {
    return Promise.resolve([...this.materiais])
  }
}

const filtro = { nome: 'Filtro de óleo', precoUnitario: 45.9, estoque: 10 }

describe('CreateMaterial', () => {
  let repository: InMemoryMaterialRepository
  let createMaterial: CreateMaterial

  beforeEach(() => {
    repository = new InMemoryMaterialRepository()
    createMaterial = new CreateMaterial(repository)
  })

  it('salva o material com os dados informados e devolve o id', async () => {
    const { id } = await createMaterial.execute(filtro)

    const material = await repository.findById(id)
    expect(material?.nome).toBe('Filtro de óleo')
    expect(material?.precoUnitario.cents).toBe(4590)
    expect(material?.estoque).toBe(10)
  })

  it('rejeita nome vazio sem salvar', async () => {
    await expect(createMaterial.execute({ ...filtro, nome: '  ' })).rejects.toThrow(DomainError)
    expect(repository.materiais).toHaveLength(0)
  })

  it('rejeita estoque negativo sem salvar', async () => {
    await expect(createMaterial.execute({ ...filtro, estoque: -1 })).rejects.toThrow(DomainError)
    expect(repository.materiais).toHaveLength(0)
  })

  it('rejeita preço negativo sem salvar', async () => {
    await expect(createMaterial.execute({ ...filtro, precoUnitario: -1 })).rejects.toThrow(
      DomainError,
    )
    expect(repository.materiais).toHaveLength(0)
  })

  it('rejeita preço com mais de duas casas decimais sem salvar', async () => {
    await expect(createMaterial.execute({ ...filtro, precoUnitario: 45.905 })).rejects.toThrow(
      DomainError,
    )
    expect(repository.materiais).toHaveLength(0)
  })
})

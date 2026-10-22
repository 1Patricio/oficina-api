import { DomainError } from '../../../../shared/domain/domain-error'
import { InMemoryVeiculoRepository } from '../../__test__/double/in-memory-veiculo.repository'
import { CreateVeiculo } from '../create-veiculo.use-case'

const fakeVeiculo = {
  ano: 2010,
  marca: 'Volkswagen',
  modelo: 'Gol',
}

describe('CreateVeiculo', () => {
  let repository: InMemoryVeiculoRepository
  let createVeiculo: CreateVeiculo

  beforeEach(() => {
    repository = new InMemoryVeiculoRepository()
    createVeiculo = new CreateVeiculo(repository)
  })

  it('salva o veículo com os dados informados e devolve o id', async () => {
    const { id } = await createVeiculo.execute(fakeVeiculo)

    const salvo = await repository.findById(id)
    expect(salvo?.ano).toBe(2010)
    expect(salvo?.marca).toBe('Volkswagen')
    expect(salvo?.modelo).toBe('Gol')
  })

  it('rejeita marca vazia sem salvar', async () => {
    await expect(createVeiculo.execute({ ...fakeVeiculo, marca: '  ' })).rejects.toThrow(
      DomainError,
    )
    expect(repository.veiculos).toHaveLength(0)
  })

  it('rejeita modelo vazio sem salvar', async () => {
    await expect(createVeiculo.execute({ ...fakeVeiculo, modelo: '  ' })).rejects.toThrow(
      DomainError,
    )
    expect(repository.veiculos).toHaveLength(0)
  })
})

import { ConflictError } from '../../../../shared/domain/conflict-error'
import { DomainError } from '../../../../shared/domain/domain-error'
import { InMemoryVeiculoRepository } from '../../__test__/double/in-memory-veiculo.repository'
import { CreateVeiculo } from '../create-veiculo.use-case'

const fakeVeiculo = {
  placa: 'ABC1234',
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
    expect(salvo?.placa.value).toBe('ABC1234')
    expect(salvo?.ano).toBe(2010)
    expect(salvo?.marca).toBe('Volkswagen')
    expect(salvo?.modelo).toBe('Gol')
  })

  it('rejeita placa inválida sem salvar', async () => {
    await expect(createVeiculo.execute({ ...fakeVeiculo, placa: 'ABC123' })).rejects.toThrow(
      DomainError,
    )
    expect(repository.veiculos).toHaveLength(0)
  })

  it('rejeita placa já cadastrada sem salvar outro veículo', async () => {
    await createVeiculo.execute(fakeVeiculo)

    await expect(createVeiculo.execute(fakeVeiculo)).rejects.toThrow(ConflictError)
    expect(repository.veiculos).toHaveLength(1)
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

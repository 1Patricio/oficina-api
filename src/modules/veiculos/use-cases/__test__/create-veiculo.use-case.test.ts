import { ConflictError } from '../../../../shared/domain/conflict-error'
import { Documento } from '../../../../shared/domain/documento'
import { DomainError } from '../../../../shared/domain/domain-error'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryClienteRepository } from '../../../clientes/__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../../clientes/domain/cliente'
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
  let clienteRepository: InMemoryClienteRepository
  let createVeiculo: CreateVeiculo

  beforeEach(() => {
    repository = new InMemoryVeiculoRepository()
    clienteRepository = new InMemoryClienteRepository()
    createVeiculo = new CreateVeiculo(repository, clienteRepository)
  })

  it('salva o veículo com os dados informados e devolve o id', async () => {
    const { id } = await createVeiculo.execute(fakeVeiculo)

    const salvo = await repository.findById(id)
    expect(salvo?.placa.value).toBe('ABC1234')
    expect(salvo?.ano).toBe(2010)
    expect(salvo?.marca).toBe('Volkswagen')
    expect(salvo?.modelo).toBe('Gol')
    expect(salvo?.clienteId).toBeNull()
  })

  it('vincula o veículo ao cliente informado', async () => {
    const maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')
    await clienteRepository.save(maria)

    const { id } = await createVeiculo.execute({ ...fakeVeiculo, clienteId: maria.id })

    const salvo = await repository.findById(id)
    expect(salvo?.clienteId).toBe(maria.id)
  })

  it('rejeita cliente inexistente sem salvar', async () => {
    await expect(
      createVeiculo.execute({ ...fakeVeiculo, clienteId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
    expect(repository.veiculos).toHaveLength(0)
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

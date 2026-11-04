import { ConflictError } from '../../../../shared/domain/conflict-error'
import { Documento } from '../../../../shared/domain/documento'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { Placa } from '../../../../shared/domain/placa'
import { InMemoryClienteRepository } from '../../../clientes/__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../../clientes/domain/cliente'
import { InMemoryVeiculoRepository } from '../../__test__/double/in-memory-veiculo.repository'
import { Veiculo } from '../../domain/veiculo'
import { UpdateVeiculo } from '../update-veiculo.use-case'

describe('UpdateVeiculo', () => {
  let repository: InMemoryVeiculoRepository
  let clienteRepository: InMemoryClienteRepository
  let updateVeiculo: UpdateVeiculo
  let gol: Veiculo

  beforeEach(async () => {
    repository = new InMemoryVeiculoRepository()
    clienteRepository = new InMemoryClienteRepository()
    updateVeiculo = new UpdateVeiculo(repository, clienteRepository)

    gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol')

    await repository.save(gol)
  })

  it('salva o veículo com os dados informados e o cliente vinculado', async () => {
    const maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')

    await clienteRepository.save(maria)

    await updateVeiculo.execute({
      veiculoId: gol.id,
      placa: 'BRA2E19',
      ano: 2015,
      marca: 'Fiat',
      modelo: 'Uno',
      clienteId: maria.id,
    })

    const salvo = await repository.findById(gol.id)

    expect(salvo?.placa.value).toBe('BRA2E19')
    expect(salvo?.modelo).toBe('Uno')
    expect(salvo?.clienteId).toBe(maria.id)
  })

  it('aceita manter a própria placa', async () => {
    await expect(
      updateVeiculo.execute({
        veiculoId: gol.id,
        placa: 'ABC1234',
        ano: 2011,
        marca: 'Volkswagen',
        modelo: 'Gol',
      }),
    ).resolves.toBeUndefined()
  })

  it('rejeita placa de outro veículo, mesmo excluído', async () => {
    const uno = Veiculo.create(Placa.create('BRA2E19'), 2005, 'Fiat', 'Uno')
    uno.delete()

    await repository.save(uno)

    await expect(
      updateVeiculo.execute({
        veiculoId: gol.id,
        placa: 'BRA2E19',
        ano: 2010,
        marca: 'Volkswagen',
        modelo: 'Gol',
      }),
    ).rejects.toThrow(ConflictError)
  })

  it('rejeita cliente inexistente', async () => {
    await expect(
      updateVeiculo.execute({
        veiculoId: gol.id,
        placa: 'ABC1234',
        ano: 2010,
        marca: 'Volkswagen',
        modelo: 'Gol',
        clienteId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d',
      }),
    ).rejects.toThrow(NotFoundError)
  })

  it('rejeita veículo inexistente', async () => {
    await expect(
      updateVeiculo.execute({
        veiculoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d',
        placa: 'ABC1234',
        ano: 2010,
        marca: 'Volkswagen',
        modelo: 'Gol',
      }),
    ).rejects.toThrow(NotFoundError)
  })
})

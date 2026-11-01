import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { Placa } from '../../../../shared/domain/placa'
import { InMemoryVeiculoRepository } from '../../__test__/double/in-memory-veiculo.repository'
import { Veiculo } from '../../domain/veiculo'
import { DeleteVeiculo } from '../delete-veiculo.use-case'

describe('DeleteVeiculo', () => {
  let repository: InMemoryVeiculoRepository
  let deleteVeiculo: DeleteVeiculo

  beforeEach(() => {
    repository = new InMemoryVeiculoRepository()
    deleteVeiculo = new DeleteVeiculo(repository)
  })

  it('marca o veículo como excluído sem apagar o registro', async () => {
    const gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol')

    await repository.save(gol)

    await deleteVeiculo.execute({ veiculoId: gol.id })

    expect(repository.veiculos[0]?.deletedAt).toBeInstanceOf(Date)
  })

  it('rejeita veículo inexistente', async () => {
    await expect(
      deleteVeiculo.execute({ veiculoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

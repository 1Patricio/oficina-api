import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { Placa } from '../../../../shared/domain/placa'
import { InMemoryVeiculoRepository } from '../../__test__/double/in-memory-veiculo.repository'
import { Veiculo } from '../../domain/veiculo'
import { GetVeiculo } from '../get-veiculo.use-case'

describe('GetVeiculo', () => {
  let repository: InMemoryVeiculoRepository
  let getVeiculo: GetVeiculo

  beforeEach(() => {
    repository = new InMemoryVeiculoRepository()
    getVeiculo = new GetVeiculo(repository)
  })

  it('devolve o veículo com a placa em texto', async () => {
    const gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol')
    await repository.save(gol)

    const veiculo = await getVeiculo.execute({ veiculoId: gol.id })

    expect(veiculo).toEqual({
      id: gol.id,
      placa: 'ABC1234',
      ano: 2010,
      marca: 'Volkswagen',
      modelo: 'Gol',
    })
  })

  it('rejeita veículo inexistente', async () => {
    await expect(
      getVeiculo.execute({ veiculoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

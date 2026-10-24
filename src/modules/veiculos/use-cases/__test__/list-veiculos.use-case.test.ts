import { Placa } from '../../../../shared/domain/placa'
import { InMemoryVeiculoRepository } from '../../__test__/double/in-memory-veiculo.repository'
import { Veiculo } from '../../domain/veiculo'
import { ListVeiculos } from '../list-veiculos.use-case'

describe('ListVeiculos', () => {
  it('lista a página de veículos com a placa em texto', async () => {
    const repository = new InMemoryVeiculoRepository()
    const gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol')
    await repository.save(gol)

    const veiculos = await new ListVeiculos(repository).execute({ page: 1, rpp: 20 })

    expect(veiculos).toMatchObject({
      page: 1,
      rpp: 20,
      more: false,
      list: [
        {
          id: gol.id,
          placa: 'ABC1234',
          ano: 2010,
          marca: 'Volkswagen',
          modelo: 'Gol',
          clienteId: null,
        },
      ],
    })
  })
})

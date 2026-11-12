import { Documento } from '../../../../shared/domain/documento'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { Placa } from '../../../../shared/domain/placa'
import { InMemoryClienteRepository } from '../../../clientes/__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../../clientes/domain/cliente'
import { InMemoryVeiculoRepository } from '../../../veiculos/__test__/double/in-memory-veiculo.repository'
import { Veiculo } from '../../../veiculos/domain/veiculo'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { OrdemServico } from '../../domain/ordem-servico'
import { EnsureOrdemServicoCliente } from '../ensure-ordem-servico-cliente'

describe('EnsureOrdemServicoCliente', () => {
  let ordem: OrdemServico
  let ensureOrdemServicoCliente: EnsureOrdemServicoCliente

  beforeEach(async () => {
    const clienteRepository = new InMemoryClienteRepository()
    const veiculoRepository = new InMemoryVeiculoRepository()
    const ordemServicoRepository = new InMemoryOrdemServicoRepository()

    const maria = Cliente.create(
      Documento.create('529.982.247-25'),
      'Maria Silva',
      'maria@email.com',
    )
    const joao = Cliente.create(Documento.create('111.444.777-35'), 'João Souza', 'joao@email.com')

    await clienteRepository.save(maria)
    await clienteRepository.save(joao)

    const gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol', maria.id)
    await veiculoRepository.save(gol)

    ordem = OrdemServico.create(maria.id, gol.id)
    await ordemServicoRepository.save(ordem)

    ensureOrdemServicoCliente = new EnsureOrdemServicoCliente(
      clienteRepository,
      veiculoRepository,
      ordemServicoRepository,
    )
  })

  it('aceita o documento e a placa do cliente e do veículo da ordem', async () => {
    await expect(
      ensureOrdemServicoCliente.execute({
        ordemServicoId: ordem.id,
        documento: '529.982.247-25',
        placa: 'ABC1234',
      }),
    ).resolves.toBeUndefined()
  })

  it('rejeita o documento de outro cliente', async () => {
    await expect(
      ensureOrdemServicoCliente.execute({
        ordemServicoId: ordem.id,
        documento: '111.444.777-35',
        placa: 'ABC1234',
      }),
    ).rejects.toThrow(NotFoundError)
  })
})

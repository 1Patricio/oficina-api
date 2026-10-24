import { Documento } from '../../../../shared/domain/documento'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryClienteRepository } from '../../__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../domain/cliente'
import { GetCliente } from '../get-cliente.use-case'

describe('GetCliente', () => {
  let repository: InMemoryClienteRepository
  let getCliente: GetCliente

  beforeEach(() => {
    repository = new InMemoryClienteRepository()
    getCliente = new GetCliente(repository)
  })

  it('devolve o cliente com o documento em texto', async () => {
    const maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')
    await repository.save(maria)

    const cliente = await getCliente.execute({ clienteId: maria.id })

    expect(cliente).toEqual({ id: maria.id, nome: 'Maria Silva', documento: '52998224725' })
  })

  it('rejeita cliente inexistente', async () => {
    await expect(
      getCliente.execute({ clienteId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

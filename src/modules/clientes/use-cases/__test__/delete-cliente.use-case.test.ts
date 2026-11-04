import { Documento } from '../../../../shared/domain/documento'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryClienteRepository } from '../../__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../domain/cliente'
import { DeleteCliente } from '../delete-cliente.use-case'

describe('DeleteCliente', () => {
  let repository: InMemoryClienteRepository
  let deleteCliente: DeleteCliente

  beforeEach(() => {
    repository = new InMemoryClienteRepository()
    deleteCliente = new DeleteCliente(repository)
  })

  it('marca o cliente como excluído sem apagar o registro', async () => {
    const maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')
    await repository.save(maria)

    await deleteCliente.execute({ clienteId: maria.id })

    expect(repository.clientes[0]?.deletedAt).toBeInstanceOf(Date)
  })

  it('rejeita cliente inexistente', async () => {
    await expect(
      deleteCliente.execute({ clienteId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})

import { ConflictError } from '../../../../shared/domain/conflict-error'
import { Documento } from '../../../../shared/domain/documento'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryClienteRepository } from '../../__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../domain/cliente'
import { UpdateCliente } from '../update-cliente.use-case'

describe('UpdateCliente', () => {
  let repository: InMemoryClienteRepository
  let updateCliente: UpdateCliente
  let maria: Cliente

  beforeEach(async () => {
    repository = new InMemoryClienteRepository()
    updateCliente = new UpdateCliente(repository)

    maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva', 'maria@email.com')

    await repository.save(maria)
  })

  it('salva o cliente com o documento, o nome e o e-mail informados', async () => {
    await updateCliente.execute({
      clienteId: maria.id,
      documento: '111.444.777-35',
      nome: 'Maria Souza',
      email: 'maria.souza@email.com',
    })

    const salvo = await repository.findById(maria.id)

    expect(salvo?.documento.value).toBe('11144477735')
    expect(salvo?.nome).toBe('Maria Souza')
    expect(salvo?.email).toBe('maria.souza@email.com')
  })

  it('aceita manter o próprio documento', async () => {
    await expect(
      updateCliente.execute({
        clienteId: maria.id,
        documento: '529.982.247-25',
        nome: 'Maria Souza',
        email: 'maria@email.com',
      }),
    ).resolves.toBeUndefined()
  })

  it('rejeita documento de outro cliente, mesmo excluído', async () => {
    const joao = Cliente.create(Documento.create('111.444.777-35'), 'João Souza', 'joao@email.com')
    joao.delete()

    await repository.save(joao)

    await expect(
      updateCliente.execute({
        clienteId: maria.id,
        documento: '111.444.777-35',
        nome: 'Maria Silva',
        email: 'maria@email.com',
      }),
    ).rejects.toThrow(ConflictError)
  })

  it('rejeita cliente inexistente', async () => {
    await expect(
      updateCliente.execute({
        clienteId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d',
        documento: '529.982.247-25',
        nome: 'Maria Silva',
        email: 'maria@email.com',
      }),
    ).rejects.toThrow(NotFoundError)
  })
})

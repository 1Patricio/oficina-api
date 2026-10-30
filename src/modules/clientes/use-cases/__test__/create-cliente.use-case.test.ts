import { ConflictError } from '../../../../shared/domain/conflict-error'
import { Documento } from '../../../../shared/domain/documento'
import { DomainError } from '../../../../shared/domain/domain-error'
import { InMemoryClienteRepository } from '../../__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../domain/cliente'
import { CreateCliente } from '../create-cliente.use-case'

const fakeCliente = {
  documento: '529.982.247-25',
  nome: 'Maria Silva',
}

describe('CreateCliente', () => {
  let repository: InMemoryClienteRepository
  let createCliente: CreateCliente

  beforeEach(() => {
    repository = new InMemoryClienteRepository()
    createCliente = new CreateCliente(repository)
  })

  it('salva o cliente com os dados informados e devolve o id', async () => {
    const { id } = await createCliente.execute(fakeCliente)

    const salvo = await repository.findById(id)
    expect(salvo?.documento.value).toBe('52998224725')
    expect(salvo?.nome).toBe('Maria Silva')
  })

  it('rejeita documento inválido sem salvar', async () => {
    await expect(
      createCliente.execute({ ...fakeCliente, documento: '123.456.789-00' }),
    ).rejects.toThrow(DomainError)
    expect(repository.clientes).toHaveLength(0)
  })

  it('rejeita documento já cadastrado sem salvar outro cliente', async () => {
    await createCliente.execute(fakeCliente)

    await expect(createCliente.execute(fakeCliente)).rejects.toThrow(ConflictError)
    expect(repository.clientes).toHaveLength(1)
  })

  it('reativa o cliente excluído com o mesmo id e o nome informado', async () => {
    const maria = Cliente.create(Documento.create(fakeCliente.documento), 'Maria Souza')
    maria.delete()
    await repository.save(maria)

    const { id } = await createCliente.execute(fakeCliente)

    expect(id).toBe(maria.id)
    const reativado = await repository.findById(id)
    expect(reativado?.nome).toBe('Maria Silva')
  })

  it('rejeita nome vazio sem salvar', async () => {
    await expect(createCliente.execute({ ...fakeCliente, nome: '  ' })).rejects.toThrow(DomainError)
    expect(repository.clientes).toHaveLength(0)
  })
})

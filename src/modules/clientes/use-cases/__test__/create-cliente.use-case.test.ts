import { DomainError } from '../../../../shared/domain/domain-error'
import { InMemoryClienteRepository } from '../../__test__/double/in-memory-cliente.repository'
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

  it('rejeita nome vazio sem salvar', async () => {
    await expect(createCliente.execute({ ...fakeCliente, nome: '  ' })).rejects.toThrow(DomainError)
    expect(repository.clientes).toHaveLength(0)
  })
})

import { Documento } from '../../../../shared/domain/documento'
import { InMemoryClienteRepository } from '../../__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../domain/cliente'
import { ListClientes } from '../list-clientes.use-case'

describe('ListClientes', () => {
  it('lista a página de clientes com o documento em texto', async () => {
    const repository = new InMemoryClienteRepository()
    const maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')
    await repository.save(maria)

    const clientes = await new ListClientes(repository).execute({ page: 1, rpp: 20 })

    expect(clientes).toMatchObject({
      page: 1,
      rpp: 20,
      more: false,
      list: [{ id: maria.id, nome: 'Maria Silva', documento: '52998224725' }],
    })
  })
})

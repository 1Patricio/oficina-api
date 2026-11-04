import { Documento } from '../../../../shared/domain/documento'
import { Page } from '../../../../shared/domain/page'
import { Cliente } from '../../domain/cliente'
import { ClienteRepository } from '../../domain/repositories/cliente.repository'

export class InMemoryClienteRepository extends ClienteRepository {
  private readonly itens = new Map<string, Cliente>()

  get clientes(): Cliente[] {
    return [...this.itens.values()]
  }

  save(cliente: Cliente): Promise<void> {
    this.itens.set(cliente.id, cliente)
    return Promise.resolve()
  }

  findById(id: string): Promise<Cliente | null> {
    const cliente = this.notDeleted.find((item) => item.id === id)
    return Promise.resolve(cliente ?? null)
  }

  findByDocumento(
    documento: Documento,
    options?: { withDeleted?: boolean },
  ): Promise<Cliente | null> {
    const itens = options?.withDeleted ? this.clientes : this.notDeleted
    const cliente = itens.find((item) => item.documento.equals(documento))
    return Promise.resolve(cliente ?? null)
  }

  list(page: number, rpp: number): Promise<Page<Cliente>> {
    const list = this.notDeleted.slice((page - 1) * rpp, page * rpp + 1)
    return Promise.resolve(Page.create({ page, rpp, list }))
  }

  private get notDeleted(): Cliente[] {
    return this.clientes.filter((item) => !item.deletedAt)
  }
}

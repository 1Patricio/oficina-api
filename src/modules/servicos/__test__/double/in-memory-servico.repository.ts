import { Page } from '../../../../shared/domain/page'
import { ServicoRepository } from '../../domain/repositories/servico.repository'
import { Servico } from '../../domain/servico'

export class InMemoryServicoRepository extends ServicoRepository {
  private readonly itens = new Map<string, Servico>()

  get servicos(): Servico[] {
    return [...this.itens.values()]
  }

  save(servico: Servico): Promise<void> {
    this.itens.set(servico.id, servico)
    return Promise.resolve()
  }

  findById(id: string): Promise<Servico | null> {
    return Promise.resolve(this.itens.get(id) ?? null)
  }

  list(page: number, rpp: number): Promise<Page<Servico>> {
    const list = this.servicos.slice((page - 1) * rpp, page * rpp + 1)
    return Promise.resolve(Page.create({ page, rpp, list }))
  }
}

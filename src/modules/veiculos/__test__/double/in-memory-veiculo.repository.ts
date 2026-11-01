import { Page } from '../../../../shared/domain/page'
import type { Placa } from '../../../../shared/domain/placa'
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository'
import { Veiculo } from '../../domain/veiculo'

export class InMemoryVeiculoRepository extends VeiculoRepository {
  private readonly itens = new Map<string, Veiculo>()

  get veiculos(): Veiculo[] {
    return [...this.itens.values()]
  }

  save(veiculo: Veiculo): Promise<void> {
    this.itens.set(veiculo.id, veiculo)
    return Promise.resolve()
  }

  findById(id: string): Promise<Veiculo | null> {
    const veiculo = this.ativos.find((item) => item.id === id)
    return Promise.resolve(veiculo ?? null)
  }

  findByPlaca(placa: Placa, options?: { withDeleted?: boolean }): Promise<Veiculo | null> {
    const itens = options?.withDeleted ? this.veiculos : this.ativos
    const veiculo = itens.find((item) => item.placa.equals(placa))
    return Promise.resolve(veiculo ?? null)
  }

  list(page: number, rpp: number): Promise<Page<Veiculo>> {
    const list = this.ativos.slice((page - 1) * rpp, page * rpp + 1)
    return Promise.resolve(Page.create({ page, rpp, list }))
  }

  private get ativos(): Veiculo[] {
    return this.veiculos.filter((item) => !item.deletedAt)
  }
}

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
    return Promise.resolve(this.itens.get(id) ?? null)
  }

  findByPlaca(placa: Placa): Promise<Veiculo | null> {
    const veiculo = this.veiculos.find((item) => item.placa.equals(placa))
    return Promise.resolve(veiculo ?? null)
  }

  list(): Promise<Veiculo[]> {
    return Promise.resolve(this.veiculos)
  }
}

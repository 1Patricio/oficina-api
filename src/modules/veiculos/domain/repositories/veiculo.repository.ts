import { Veiculo } from '../veiculo'

export abstract class VeiculoRepository {
  abstract save(veiculo: Veiculo): Promise<void>
  abstract findById(id: string): Promise<Veiculo | null>
  abstract list(term?: string): Promise<Veiculo[]>
}

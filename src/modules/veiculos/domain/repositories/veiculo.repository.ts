import type { Page } from '../../../../shared/domain/page'
import type { Placa } from '../../../../shared/domain/placa'
import { Veiculo } from '../veiculo'

export abstract class VeiculoRepository {
  abstract save(veiculo: Veiculo): Promise<void>
  abstract findById(id: string): Promise<Veiculo | null>
  abstract findByPlaca(placa: Placa): Promise<Veiculo | null>
  abstract list(page: number, rpp: number, term?: string): Promise<Page<Veiculo>>
}

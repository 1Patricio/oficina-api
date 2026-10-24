import type { Page } from '../../../../shared/domain/page'
import { Servico } from '../servico'

export abstract class ServicoRepository {
  abstract save(servico: Servico): Promise<void>
  abstract findById(id: string): Promise<Servico | null>
  abstract list(page: number, rpp: number, term?: string): Promise<Page<Servico>>
}

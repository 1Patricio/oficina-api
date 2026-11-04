import { Documento } from '../../../../shared/domain/documento'
import { Page } from '../../../../shared/domain/page'
import { Cliente } from '../cliente'

export abstract class ClienteRepository {
  abstract save(cliente: Cliente): Promise<void>
  abstract findById(id: string): Promise<Cliente | null>
  abstract findByDocumento(
    documento: Documento,
    options?: { withDeleted?: boolean },
  ): Promise<Cliente | null>
  abstract list(page: number, rpp: number, term?: string): Promise<Page<Cliente>>
}

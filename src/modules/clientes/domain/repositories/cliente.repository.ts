import { Documento } from '../../../../shared/domain/documento'
import { Cliente } from '../cliente'

export abstract class ClienteRepository {
  abstract save(cliente: Cliente): Promise<void>
  abstract findById(id: string): Promise<Cliente | null>
  abstract findByDocumento(documento: Documento): Promise<Cliente | null>
}

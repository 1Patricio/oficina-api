import { Cliente } from '../cliente'

export abstract class ClienteRepository {
  abstract save(cliente: Cliente): Promise<void>
  abstract findById(id: string): Promise<Cliente | null>
}

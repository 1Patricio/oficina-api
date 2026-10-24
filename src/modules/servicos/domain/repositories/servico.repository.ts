import { Servico } from '../servico'

export abstract class ServicoRepository {
  abstract save(servico: Servico): Promise<void>
  abstract findById(id: string): Promise<Servico | null>
  abstract list(term?: string): Promise<Servico[]>
}

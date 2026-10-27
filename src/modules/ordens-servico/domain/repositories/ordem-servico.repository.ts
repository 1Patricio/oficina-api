import type { Page } from '../../../../shared/domain/page'
import { OrdemServico } from '../ordem-servico'
import type { StatusOrdemServico } from '../status-ordem-servico'

export abstract class OrdemServicoRepository {
  abstract save(ordem: OrdemServico): Promise<void>
  abstract findById(id: string): Promise<OrdemServico | null>
  abstract list(page: number, rpp: number, status?: StatusOrdemServico): Promise<Page<OrdemServico>>
}

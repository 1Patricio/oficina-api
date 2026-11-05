import type { Page } from '../../../../shared/domain/page'
import { Material } from '../material'

export abstract class MaterialRepository {
  abstract save(material: Material): Promise<void>
  abstract findById(id: string): Promise<Material | null>
  abstract findManyByIds(ids: string[]): Promise<Material[]>
  abstract isUsedInServico(id: string): Promise<boolean>
  abstract isUsedInOrdemServicoPendente(id: string): Promise<boolean>
  abstract list(page: number, rpp: number, term?: string): Promise<Page<Material>>
}

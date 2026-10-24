import type { Page } from '../../../../shared/domain/page'
import { Material } from '../material'

export abstract class MaterialRepository {
  abstract save(material: Material): Promise<void>
  abstract findById(id: string): Promise<Material | null>
  abstract list(page: number, rpp: number, term?: string): Promise<Page<Material>>
}

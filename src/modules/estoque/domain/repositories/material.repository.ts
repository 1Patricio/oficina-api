import { Material } from '../material'

export abstract class MaterialRepository {
  abstract save(material: Material): Promise<void>
  abstract findById(id: string): Promise<Material | null>
  abstract list(term?: string): Promise<Material[]>
}

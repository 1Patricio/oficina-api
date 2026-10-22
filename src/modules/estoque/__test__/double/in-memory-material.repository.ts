import { Material } from '../../domain/material'
import { MaterialRepository } from '../../domain/repositories/material.repository'

export class InMemoryMaterialRepository extends MaterialRepository {
  private readonly itens = new Map<string, Material>()

  get materiais(): Material[] {
    return [...this.itens.values()]
  }

  save(material: Material): Promise<void> {
    this.itens.set(material.id, material)
    return Promise.resolve()
  }

  findById(id: string): Promise<Material | null> {
    return Promise.resolve(this.itens.get(id) ?? null)
  }

  list(): Promise<Material[]> {
    return Promise.resolve(this.materiais)
  }
}

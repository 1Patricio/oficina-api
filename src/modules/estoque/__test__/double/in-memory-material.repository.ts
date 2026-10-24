import { Page } from '../../../../shared/domain/page'
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

  list(page: number, rpp: number): Promise<Page<Material>> {
    const list = this.materiais.slice((page - 1) * rpp, page * rpp + 1)
    return Promise.resolve(Page.create({ page, rpp, list }))
  }
}

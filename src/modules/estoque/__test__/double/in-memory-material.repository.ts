import { Page } from '../../../../shared/domain/page'
import { Material } from '../../domain/material'
import { MaterialRepository } from '../../domain/repositories/material.repository'

export class InMemoryMaterialRepository extends MaterialRepository {
  private readonly itens = new Map<string, Material>()
  readonly usadosEmServico = new Set<string>()

  get materiais(): Material[] {
    return [...this.itens.values()]
  }

  save(material: Material): Promise<void> {
    this.itens.set(material.id, material)
    return Promise.resolve()
  }

  findById(id: string): Promise<Material | null> {
    const material = this.notDeleted.find((item) => item.id === id)
    return Promise.resolve(material ?? null)
  }

  findManyByIds(ids: string[]): Promise<Material[]> {
    return Promise.resolve(this.notDeleted.filter((item) => ids.includes(item.id)))
  }

  isUsedInServico(id: string): Promise<boolean> {
    return Promise.resolve(this.usadosEmServico.has(id))
  }

  list(page: number, rpp: number): Promise<Page<Material>> {
    const list = this.notDeleted.slice((page - 1) * rpp, page * rpp + 1)
    return Promise.resolve(Page.create({ page, rpp, list }))
  }

  private get notDeleted(): Material[] {
    return this.materiais.filter((item) => !item.deletedAt)
  }
}

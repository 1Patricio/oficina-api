import { Injectable } from '@nestjs/common'
import type { Page } from '../../../shared/domain/page'
import { MaterialRepository } from '../domain/repositories/material.repository'

type Request = {
  page: number
  rpp: number
  term?: string
}

type Response = {
  id: string
  nome: string
  precoUnitario: number
  estoque: number
}

@Injectable()
export class ListMateriais {
  constructor(private readonly materialRepository: MaterialRepository) {}

  async execute({ page, rpp, term }: Request): Promise<Page<Response>> {
    const materiais = await this.materialRepository.list(page, rpp, term)
    return materiais.map((material) => ({
      id: material.id,
      nome: material.nome,
      precoUnitario: material.precoUnitario.reais,
      estoque: material.estoque,
    }))
  }
}

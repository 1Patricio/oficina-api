import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { MaterialRepository } from '../domain/repositories/material.repository'

type Request = {
  materialId: string
}

type Response = {
  id: string
  nome: string
  precoUnitario: number
  estoque: number
}

@Injectable()
export class GetMaterial {
  constructor(private readonly materialRepository: MaterialRepository) {}

  async execute({ materialId }: Request): Promise<Response> {
    const material = await this.materialRepository.findById(materialId)

    if (!material) throw new NotFoundError('Material não encontrado.')

    return {
      id: material.id,
      nome: material.nome,
      precoUnitario: material.precoUnitario.reais,
      estoque: material.estoque,
    }
  }
}

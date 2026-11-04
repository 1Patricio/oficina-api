import { Injectable } from '@nestjs/common'
import { Dinheiro } from '../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { MaterialRepository } from '../domain/repositories/material.repository'

type Request = {
  materialId: string
  nome: string
  precoUnitario: number
  estoque: number
}

@Injectable()
export class UpdateMaterial {
  constructor(private readonly materialRepository: MaterialRepository) {}

  async execute({ materialId, nome, precoUnitario, estoque }: Request): Promise<void> {
    const material = await this.materialRepository.findById(materialId)

    if (!material) throw new NotFoundError('Material não encontrado.')

    material.update(nome, Dinheiro.fromReais(precoUnitario), estoque)
    await this.materialRepository.save(material)
  }
}

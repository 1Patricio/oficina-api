import { Injectable } from '@nestjs/common'
import { Dinheiro } from '../../../shared/domain/dinheiro'
import { Material } from '../domain/material'
import { MaterialRepository } from '../domain/repositories/material.repository'

type Input = {
  nome: string
  precoUnitario: number
  estoque: number
}

type Output = {
  id: string
}

@Injectable()
export class CreateMaterial {
  constructor(private readonly materialRepository: MaterialRepository) {}

  async execute(input: Input): Promise<Output> {
    const material = Material.create(
      input.nome,
      Dinheiro.fromReais(input.precoUnitario),
      input.estoque,
    )
    await this.materialRepository.save(material)
    return { id: material.id }
  }
}

import { Injectable } from '@nestjs/common'
import { Dinheiro } from '../../../shared/domain/dinheiro'
import { Material } from '../domain/material'
import { MaterialRepository } from '../domain/repositories/material.repository'

type Request = {
  nome: string
  precoUnitario: number
  estoque: number
}

type Response = {
  id: string
}

@Injectable()
export class CreateMaterial {
  constructor(private readonly materialRepository: MaterialRepository) {}

  async execute({ nome, precoUnitario, estoque }: Request): Promise<Response> {
    const material = Material.create(nome, Dinheiro.fromReais(precoUnitario), estoque)
    await this.materialRepository.save(material)
    return { id: material.id }
  }
}

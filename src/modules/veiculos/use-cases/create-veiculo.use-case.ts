import { Injectable } from '@nestjs/common'
import { VeiculoRepository } from '../domain/repositories/veiculo.repository'
import { Veiculo } from '../domain/veiculo'

type Request = {
  ano: number
  marca: string
  modelo: string
}

type Response = {
  id: string
}

@Injectable()
export class CreateVeiculo {
  constructor(private readonly veiculoRepository: VeiculoRepository) {}

  async execute({ ano, marca, modelo }: Request): Promise<Response> {
    const veiculo = Veiculo.create(ano, marca, modelo)
    await this.veiculoRepository.save(veiculo)
    return { id: veiculo.id }
  }
}

import { Injectable } from '@nestjs/common'
import { ConflictError } from '../../../shared/domain/conflict-error'
import { Placa } from '../../../shared/domain/placa'
import { VeiculoRepository } from '../domain/repositories/veiculo.repository'
import { Veiculo } from '../domain/veiculo'

type Request = {
  placa: string
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

  async execute({ placa, ano, marca, modelo }: Request): Promise<Response> {
    const veiculo = Veiculo.create(Placa.create(placa), ano, marca, modelo)
    if (await this.veiculoRepository.findByPlaca(veiculo.placa)) {
      throw new ConflictError('Veículo já cadastrado.')
    }
    await this.veiculoRepository.save(veiculo)
    return { id: veiculo.id }
  }
}

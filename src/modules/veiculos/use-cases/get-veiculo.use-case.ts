import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { VeiculoRepository } from '../domain/repositories/veiculo.repository'

type Request = {
  veiculoId: string
}

type Response = {
  id: string
  placa: string
  ano: number
  marca: string
  modelo: string
  clienteId: string | null
}

@Injectable()
export class GetVeiculo {
  constructor(private readonly veiculoRepository: VeiculoRepository) {}

  async execute({ veiculoId }: Request): Promise<Response> {
    const veiculo = await this.veiculoRepository.findById(veiculoId)

    if (!veiculo) throw new NotFoundError('Veículo não encontrado.')

    return {
      id: veiculo.id,
      placa: veiculo.placa.value,
      ano: veiculo.ano,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      clienteId: veiculo.clienteId,
    }
  }
}

import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { VeiculoRepository } from '../domain/repositories/veiculo.repository'

type Request = {
  veiculoId: string
}

@Injectable()
export class DeleteVeiculo {
  constructor(private readonly veiculoRepository: VeiculoRepository) {}

  async execute({ veiculoId }: Request): Promise<void> {
    const veiculo = await this.veiculoRepository.findById(veiculoId)

    if (!veiculo) throw new NotFoundError('Veículo não encontrado.')

    veiculo.delete()
    await this.veiculoRepository.save(veiculo)
  }
}

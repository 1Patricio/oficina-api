import { Injectable } from '@nestjs/common'
import { ConflictError } from '../../../shared/domain/conflict-error'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { Placa } from '../../../shared/domain/placa'
import { ClienteRepository } from '../../clientes/domain/repositories/cliente.repository'
import { VeiculoRepository } from '../domain/repositories/veiculo.repository'

type Request = {
  veiculoId: string
  placa: string
  ano: number
  marca: string
  modelo: string
  clienteId?: string
}

@Injectable()
export class UpdateVeiculo {
  constructor(
    private readonly veiculoRepository: VeiculoRepository,
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute({ veiculoId, placa, ano, marca, modelo, clienteId }: Request): Promise<void> {
    const veiculo = await this.veiculoRepository.findById(veiculoId)

    if (!veiculo) throw new NotFoundError('Veículo não encontrado.')

    if (clienteId && !(await this.clienteRepository.findById(clienteId))) {
      throw new NotFoundError('Cliente não encontrado.')
    }

    const existingVeiculo = await this.veiculoRepository.findByPlaca(Placa.create(placa), {
      withDeleted: true,
    })

    if (existingVeiculo && !existingVeiculo.equals(veiculo)) {
      throw new ConflictError('Placa já cadastrada.')
    }

    veiculo.update(Placa.create(placa), ano, marca, modelo, clienteId ?? null)
    await this.veiculoRepository.save(veiculo)
  }
}

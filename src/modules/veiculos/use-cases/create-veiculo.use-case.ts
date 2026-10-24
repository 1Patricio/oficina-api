import { Injectable } from '@nestjs/common'
import { ConflictError } from '../../../shared/domain/conflict-error'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { Placa } from '../../../shared/domain/placa'
import { ClienteRepository } from '../../clientes/domain/repositories/cliente.repository'
import { VeiculoRepository } from '../domain/repositories/veiculo.repository'
import { Veiculo } from '../domain/veiculo'

type Request = {
  placa: string
  ano: number
  marca: string
  modelo: string
  clienteId?: string
}

type Response = {
  id: string
}

@Injectable()
export class CreateVeiculo {
  constructor(
    private readonly veiculoRepository: VeiculoRepository,
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute({ placa, ano, marca, modelo, clienteId }: Request): Promise<Response> {
    const veiculo = Veiculo.create(Placa.create(placa), ano, marca, modelo, clienteId)
    if (clienteId && !(await this.clienteRepository.findById(clienteId))) {
      throw new NotFoundError('Cliente não encontrado.')
    }
    if (await this.veiculoRepository.findByPlaca(veiculo.placa)) {
      throw new ConflictError('Veículo já cadastrado.')
    }
    await this.veiculoRepository.save(veiculo)
    return { id: veiculo.id }
  }
}

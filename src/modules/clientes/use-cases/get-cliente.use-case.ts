import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { ClienteRepository } from '../domain/repositories/cliente.repository'

type Request = {
  clienteId: string
}

type Response = {
  id: string
  nome: string
  documento: string
}

@Injectable()
export class GetCliente {
  constructor(private clienteRepository: ClienteRepository) {}

  async execute({ clienteId }: Request): Promise<Response> {
    const cliente = await this.clienteRepository.findById(clienteId)

    if (!cliente) throw new NotFoundError('Cliente não encontrado.')

    return {
      id: cliente.id,
      nome: cliente.nome,
      documento: cliente.documento.value,
    }
  }
}

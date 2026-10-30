import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { ClienteRepository } from '../domain/repositories/cliente.repository'

type Request = {
  clienteId: string
}

@Injectable()
export class DeleteCliente {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  async execute({ clienteId }: Request): Promise<void> {
    const cliente = await this.clienteRepository.findById(clienteId)

    if (!cliente) throw new NotFoundError('Cliente não encontrado.')

    cliente.delete()
    await this.clienteRepository.save(cliente)
  }
}

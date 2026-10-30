import { Injectable } from '@nestjs/common'
import { ConflictError } from '../../../shared/domain/conflict-error'
import { Documento } from '../../../shared/domain/documento'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { ClienteRepository } from '../domain/repositories/cliente.repository'

type Request = {
  clienteId: string
  documento: string
  nome: string
}

@Injectable()
export class UpdateCliente {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  async execute({ clienteId, documento, nome }: Request): Promise<void> {
    const cliente = await this.clienteRepository.findById(clienteId)

    if (!cliente) throw new NotFoundError('Cliente não encontrado.')

    const cadastrado = await this.clienteRepository.findByDocumento(Documento.create(documento), {
      withDeleted: true,
    })

    if (cadastrado && !cadastrado.equals(cliente)) {
      throw new ConflictError('Documento já cadastrado.')
    }

    cliente.update(Documento.create(documento), nome)
    await this.clienteRepository.save(cliente)
  }
}

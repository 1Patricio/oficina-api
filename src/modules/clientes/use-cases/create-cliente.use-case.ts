import { Injectable } from '@nestjs/common'
import { ConflictError } from '../../../shared/domain/conflict-error'
import { Documento } from '../../../shared/domain/documento'
import { Cliente } from '../domain/cliente'
import { ClienteRepository } from '../domain/repositories/cliente.repository'

type Request = {
  documento: string
  nome: string
}

type Response = {
  id: string
}

@Injectable()
export class CreateCliente {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  async execute({ documento, nome }: Request): Promise<Response> {
    const cliente = Cliente.create(Documento.create(documento), nome)
    const cadastrado = await this.clienteRepository.findByDocumento(cliente.documento, {
      withDeleted: true,
    })

    if (cadastrado && !cadastrado.deletedAt) throw new ConflictError('Cliente já cadastrado.')

    if (cadastrado) {
      const reativado = Cliente.restore(cadastrado.id, cliente.documento, nome, null)
      await this.clienteRepository.save(reativado)
      return { id: reativado.id }
    }

    await this.clienteRepository.save(cliente)
    return { id: cliente.id }
  }
}

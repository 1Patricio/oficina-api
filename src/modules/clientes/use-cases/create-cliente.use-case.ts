import { Injectable } from '@nestjs/common'
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
    await this.clienteRepository.save(cliente)
    return { id: cliente.id }
  }
}

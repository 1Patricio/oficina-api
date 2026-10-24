import { Injectable } from '@nestjs/common'
import type { Page } from '../../../shared/domain/page'
import { ClienteRepository } from '../domain/repositories/cliente.repository'

type Request = {
  page: number
  rpp: number
  term?: string
}

type Response = {
  id: string
  nome: string
  documento: string
}

@Injectable()
export class ListClientes {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  async execute({ page, rpp, term }: Request): Promise<Page<Response>> {
    const clientes = await this.clienteRepository.list(page, rpp, term)
    return clientes.map((cliente) => ({
      id: cliente.id,
      nome: cliente.nome,
      documento: cliente.documento.value,
    }))
  }
}

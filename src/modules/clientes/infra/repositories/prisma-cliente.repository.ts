import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../core/database/prisma.service'
import type { ClienteModel } from '../../../../generated/prisma/models'
import { Documento } from '../../../../shared/domain/documento'
import { Page } from '../../../../shared/domain/page'
import { Cliente } from '../../domain/cliente'
import { ClienteRepository } from '../../domain/repositories/cliente.repository'

@Injectable()
export class PrismaClienteRepository implements ClienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(cliente: Cliente): Promise<void> {
    const data = {
      nome: cliente.nome,
      documento: cliente.documento.value,
    }

    await this.prisma.cliente.upsert({
      where: { id: cliente.id },
      create: { id: cliente.id, ...data },
      update: data,
    })
  }

  async findById(id: string): Promise<Cliente | null> {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } })
    return cliente ? toDomain(cliente) : null
  }

  async findByDocumento(documento: Documento): Promise<Cliente | null> {
    const cliente = await this.prisma.cliente.findUnique({ where: { documento: documento.value } })
    return cliente ? toDomain(cliente) : null
  }

  async list(page: number, rpp: number, term?: string): Promise<Page<Cliente>> {
    const clientes = await this.prisma.cliente.findMany({
      where: { nome: { contains: term, mode: 'insensitive' } },
      orderBy: { nome: 'asc' },
      skip: (page - 1) * rpp,
      take: rpp + 1,
    })
    return Page.create({ page, rpp, list: clientes.map((cliente) => toDomain(cliente)) })
  }
}

function toDomain(cliente: ClienteModel): Cliente {
  return Cliente.restore(cliente.id, Documento.create(cliente.documento), cliente.nome)
}

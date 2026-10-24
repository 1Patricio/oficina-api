import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../core/database/prisma.service'
import type { ServicoMaterialModel, ServicoModel } from '../../../../generated/prisma/models'
import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { Page } from '../../../../shared/domain/page'
import { MaterialNecessario } from '../../domain/material-necessario'
import { ServicoRepository } from '../../domain/repositories/servico.repository'
import { Servico } from '../../domain/servico'

@Injectable()
export class PrismaServicoRepository implements ServicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(servico: Servico): Promise<void> {
    const data = {
      nome: servico.nome,
      descricao: servico.descricao,
      precoCentavos: servico.preco.cents,
    }

    const materiais = servico.materiais.map(({ materialId, quantidade }) => ({
      materialId,
      quantidade,
    }))

    await this.prisma.servico.upsert({
      where: { id: servico.id },
      create: { id: servico.id, ...data, materiais: { create: materiais } },
      update: { ...data, materiais: { deleteMany: {}, create: materiais } },
    })
  }

  async findById(id: string): Promise<Servico | null> {
    const servico = await this.prisma.servico.findUnique({
      where: { id },
      include: { materiais: true },
    })
    return servico ? toDomain(servico) : null
  }

  async list(page: number, rpp: number, term?: string): Promise<Page<Servico>> {
    const servicos = await this.prisma.servico.findMany({
      where: { nome: { contains: term, mode: 'insensitive' } },
      include: { materiais: true },
      orderBy: { nome: 'asc' },
      skip: (page - 1) * rpp,
      take: rpp + 1,
    })
    return Page.create({ page, rpp, list: servicos.map((servico) => toDomain(servico)) })
  }
}

function toDomain(servico: ServicoModel & { materiais: ServicoMaterialModel[] }): Servico {
  return Servico.restore(
    servico.id,
    servico.nome,
    servico.descricao,
    Dinheiro.fromCents(servico.precoCentavos),
    servico.materiais.map(({ materialId, quantidade }) =>
      MaterialNecessario.create(materialId, quantidade),
    ),
  )
}

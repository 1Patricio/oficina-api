import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../core/database/prisma.service'
import type { MaterialModel } from '../../../../generated/prisma/models'
import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { Material } from '../../domain/material'
import { MaterialRepository } from '../../domain/repositories/material.repository'

@Injectable()
export class PrismaMaterialRepository implements MaterialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(material: Material): Promise<void> {
    const data = {
      nome: material.nome,
      precoUnitarioCentavos: material.precoUnitario.cents,
      estoque: material.estoque,
    }

    await this.prisma.material.upsert({
      where: { id: material.id },
      create: { id: material.id, ...data },
      update: data,
    })
  }

  async findById(id: string): Promise<Material | null> {
    const material = await this.prisma.material.findUnique({ where: { id } })
    return material ? toDomain(material) : null
  }

  async list(term?: string): Promise<Material[]> {
    const materiais = await this.prisma.material.findMany({
      where: { nome: { contains: term, mode: 'insensitive' } },
      orderBy: { nome: 'asc' },
    })
    return materiais.map(toDomain)
  }
}

function toDomain(material: MaterialModel): Material {
  return Material.restore(
    material.id,
    material.nome,
    Dinheiro.fromCents(material.precoUnitarioCentavos),
    material.estoque,
  )
}

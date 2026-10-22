import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../core/database/prisma.service'
import type { VeiculoModel } from '../../../../generated/prisma/models'
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository'
import { Veiculo } from '../../domain/veiculo'

@Injectable()
export class PrismaVeiculoRepository implements VeiculoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(veiculo: Veiculo): Promise<void> {
    const data = {
      ano: veiculo.ano,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
    }

    await this.prisma.veiculo.upsert({
      where: { id: veiculo.id },
      create: { id: veiculo.id, ...data },
      update: data,
    })
  }

  async findById(id: string): Promise<Veiculo | null> {
    const veiculo = await this.prisma.veiculo.findUnique({ where: { id } })
    return veiculo ? toDomain(veiculo) : null
  }

  async list(term?: string): Promise<Veiculo[]> {
    const veiculos = await this.prisma.veiculo.findMany({
      where: term
        ? {
            OR: [
              { marca: { contains: term, mode: 'insensitive' } },
              { modelo: { contains: term, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: [{ marca: 'asc' }, { modelo: 'asc' }],
    })
    return veiculos.map((veiculo) => toDomain(veiculo))
  }
}

function toDomain(veiculo: VeiculoModel): Veiculo {
  return Veiculo.restore(veiculo.id, veiculo.ano, veiculo.marca, veiculo.modelo)
}

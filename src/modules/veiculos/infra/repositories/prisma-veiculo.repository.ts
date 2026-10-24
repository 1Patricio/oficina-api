import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../core/database/prisma.service'
import type { VeiculoModel } from '../../../../generated/prisma/models'
import { Page } from '../../../../shared/domain/page'
import { Placa } from '../../../../shared/domain/placa'
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository'
import { Veiculo } from '../../domain/veiculo'

@Injectable()
export class PrismaVeiculoRepository implements VeiculoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(veiculo: Veiculo): Promise<void> {
    const data = {
      placa: veiculo.placa.value,
      ano: veiculo.ano,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      clienteId: veiculo.clienteId,
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

  async findByPlaca(placa: Placa): Promise<Veiculo | null> {
    const veiculo = await this.prisma.veiculo.findUnique({ where: { placa: placa.value } })
    return veiculo ? toDomain(veiculo) : null
  }

  async list(page: number, rpp: number, term?: string): Promise<Page<Veiculo>> {
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
      skip: (page - 1) * rpp,
      take: rpp + 1,
    })
    return Page.create({ page, rpp, list: veiculos.map((veiculo) => toDomain(veiculo)) })
  }
}

function toDomain(veiculo: VeiculoModel): Veiculo {
  return Veiculo.restore(
    veiculo.id,
    Placa.create(veiculo.placa),
    veiculo.ano,
    veiculo.marca,
    veiculo.modelo,
    veiculo.clienteId,
  )
}

import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../core/database/prisma.service'
import type {
  ItemMaterialModel,
  ItemServicoModel,
  OrcamentoModel,
  OrdemServicoModel,
} from '../../../../generated/prisma/models'
import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { Page } from '../../../../shared/domain/page'
import { ItemMaterial } from '../../domain/item-material'
import { ItemServico } from '../../domain/item-servico'
import { Orcamento } from '../../domain/orcamento'
import { OrdemServico } from '../../domain/ordem-servico'
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository'
import { StatusOrcamento } from '../../domain/status-orcamento'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'

@Injectable()
export class PrismaOrdemServicoRepository implements OrdemServicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(ordem: OrdemServico): Promise<void> {
    const data = {
      clienteId: ordem.clienteId,
      veiculoId: ordem.veiculoId,
      status: ordem.status,
      dataRecebimento: ordem.dataRecebimento,
      dataInicio: ordem.dataInicio,
      dataFinalizacao: ordem.dataFinalizacao,
      dataEntrega: ordem.dataEntrega,
    }

    const servicos = ordem.servicos.map(({ servicoId, nome, preco }) => ({
      servicoId,
      nome,
      precoCentavos: preco.cents,
    }))

    const materiais = ordem.materiais.map(({ materialId, nome, precoUnitario, quantidade }) => ({
      materialId,
      nome,
      precoUnitarioCentavos: precoUnitario.cents,
      quantidade,
    }))

    const orcamentos = ordem.orcamentos.map(({ valor, status, dataEnvio, dataResposta }) => ({
      valorCentavos: valor.cents,
      status,
      dataEnvio,
      dataResposta,
    }))

    await this.prisma.ordemServico.upsert({
      where: { id: ordem.id },
      create: {
        id: ordem.id,
        ...data,
        servicos: { create: servicos },
        materiais: { create: materiais },
        orcamentos: { create: orcamentos },
      },
      update: {
        ...data,
        servicos: { deleteMany: {}, create: servicos },
        materiais: { deleteMany: {}, create: materiais },
        orcamentos: { deleteMany: {}, create: orcamentos },
      },
    })
  }

  async findById(id: string): Promise<OrdemServico | null> {
    const ordem = await this.prisma.ordemServico.findUnique({
      where: { id },
      include: {
        servicos: true,
        materiais: true,
        orcamentos: { orderBy: [{ dataEnvio: 'asc' }, { id: 'asc' }] },
      },
    })
    return ordem ? toDomain(ordem) : null
  }

  async list(page: number, rpp: number, status?: StatusOrdemServico): Promise<Page<OrdemServico>> {
    const ordens = await this.prisma.ordemServico.findMany({
      where: { status },
      include: {
        servicos: true,
        materiais: true,
        orcamentos: { orderBy: [{ dataEnvio: 'asc' }, { id: 'asc' }] },
      },
      orderBy: [{ dataRecebimento: 'asc' }, { id: 'asc' }],
      skip: (page - 1) * rpp,
      take: rpp + 1,
    })

    return Page.create({ page, rpp, list: ordens.map((ordem) => toDomain(ordem)) })
  }
}

function toDomain(
  ordem: OrdemServicoModel & {
    servicos: ItemServicoModel[]
    materiais: ItemMaterialModel[]
    orcamentos: OrcamentoModel[]
  },
): OrdemServico {
  return OrdemServico.restore({
    id: ordem.id,
    clienteId: ordem.clienteId,
    veiculoId: ordem.veiculoId,
    status: StatusOrdemServico[ordem.status],
    dataRecebimento: ordem.dataRecebimento,
    dataInicio: ordem.dataInicio,
    dataFinalizacao: ordem.dataFinalizacao,
    dataEntrega: ordem.dataEntrega,
    servicos: ordem.servicos.map(({ servicoId, nome, precoCentavos }) =>
      ItemServico.create(servicoId, nome, Dinheiro.fromCents(precoCentavos)),
    ),
    materiais: ordem.materiais.map(({ materialId, nome, precoUnitarioCentavos, quantidade }) =>
      ItemMaterial.create(materialId, nome, Dinheiro.fromCents(precoUnitarioCentavos), quantidade),
    ),
    orcamentos: ordem.orcamentos.map(({ valorCentavos, status, dataEnvio, dataResposta }) =>
      Orcamento.restore(
        Dinheiro.fromCents(valorCentavos),
        StatusOrcamento[status],
        dataEnvio,
        dataResposta,
      ),
    ),
  })
}

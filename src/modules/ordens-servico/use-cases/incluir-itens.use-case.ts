import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { MaterialRepository } from '../../estoque/domain/repositories/material.repository'
import { ServicoRepository } from '../../servicos/domain/repositories/servico.repository'
import { ItemMaterial } from '../domain/item-material'
import { ItemServico } from '../domain/item-servico'
import { OrdemServicoRepository } from '../domain/repositories/ordem-servico.repository'

type Request = {
  ordemServicoId: string
  servicoIds?: string[]
  materiais?: { materialId: string; quantidade: number }[]
}

@Injectable()
export class IncluirItens {
  constructor(
    private readonly ordemServicoRepository: OrdemServicoRepository,
    private readonly servicoRepository: ServicoRepository,
    private readonly materialRepository: MaterialRepository,
  ) {}

  async execute({ ordemServicoId, servicoIds = [], materiais = [] }: Request): Promise<void> {
    const ordem = await this.ordemServicoRepository.findById(ordemServicoId)
    if (!ordem) throw new NotFoundError('Ordem de serviço não encontrada.')

    const itensServico = await Promise.all(
      servicoIds.map(async (servicoId) => {
        const servico = await this.servicoRepository.findById(servicoId)
        if (!servico) throw new NotFoundError('Serviço não encontrado.')
        return ItemServico.create(servico.id, servico.nome, servico.preco)
      }),
    )
    const itensMaterial = await Promise.all(
      materiais.map(async ({ materialId, quantidade }) => {
        const material = await this.materialRepository.findById(materialId)
        if (!material) throw new NotFoundError('Material não encontrado.')
        return ItemMaterial.create(material.id, material.nome, material.precoUnitario, quantidade)
      }),
    )

    for (const item of itensServico) ordem.incluirServico(item)
    for (const item of itensMaterial) ordem.incluirMaterial(item)
    await this.ordemServicoRepository.save(ordem)
  }
}

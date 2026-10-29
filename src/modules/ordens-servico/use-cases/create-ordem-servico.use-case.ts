import { Injectable } from '@nestjs/common'
import { Documento } from '../../../shared/domain/documento'
import { DomainError } from '../../../shared/domain/domain-error'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { ClienteRepository } from '../../clientes/domain/repositories/cliente.repository'
import { MaterialRepository } from '../../estoque/domain/repositories/material.repository'
import { ServicoRepository } from '../../servicos/domain/repositories/servico.repository'
import { VeiculoRepository } from '../../veiculos/domain/repositories/veiculo.repository'
import { ItemMaterial } from '../domain/item-material'
import { ItemServico } from '../domain/item-servico'
import { OrdemServico } from '../domain/ordem-servico'
import { OrdemServicoRepository } from '../domain/repositories/ordem-servico.repository'

type Request = {
  documento: string
  veiculoId: string
  servicoIds?: string[]
  materiais?: { materialId: string; quantidade: number }[]
}

type Response = {
  id: string
}

@Injectable()
export class CreateOrdemServico {
  constructor(
    private readonly ordemServicoRepository: OrdemServicoRepository,
    private readonly clienteRepository: ClienteRepository,
    private readonly veiculoRepository: VeiculoRepository,
    private readonly servicoRepository: ServicoRepository,
    private readonly materialRepository: MaterialRepository,
  ) {}

  async execute({
    documento,
    veiculoId,
    servicoIds = [],
    materiais = [],
  }: Request): Promise<Response> {
    const cliente = await this.clienteRepository.findByDocumento(Documento.create(documento))
    if (!cliente) throw new NotFoundError('Cliente não encontrado.')

    const veiculo = await this.veiculoRepository.findById(veiculoId)
    if (!veiculo) throw new NotFoundError('Veículo não encontrado.')
    if (veiculo.clienteId && veiculo.clienteId !== cliente.id) {
      throw new DomainError('Veículo pertence a outro cliente.')
    }

    const itensServico = await Promise.all(
      servicoIds.map(async (servicoId) => {
        const servico = await this.servicoRepository.findById(servicoId)
        if (!servico) throw new NotFoundError('Serviço não encontrado.')
        return ItemServico.create(servico.id, servico.nome, servico.preco, servico.materiais)
      }),
    )
    const itensMaterial = await Promise.all(
      materiais.map(async ({ materialId, quantidade }) => {
        const material = await this.materialRepository.findById(materialId)
        if (!material) throw new NotFoundError('Material não encontrado.')
        return ItemMaterial.create(material.id, material.nome, material.precoUnitario, quantidade)
      }),
    )

    const ordem = OrdemServico.create(cliente.id, veiculo.id)
    for (const item of itensServico) ordem.incluirServico(item)
    for (const item of itensMaterial) ordem.incluirMaterial(item)
    await this.ordemServicoRepository.save(ordem)
    return { id: ordem.id }
  }
}

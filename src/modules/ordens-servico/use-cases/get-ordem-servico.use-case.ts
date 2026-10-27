import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { OrdemServicoRepository } from '../domain/repositories/ordem-servico.repository'
import { StatusOrcamento } from '../domain/status-orcamento'
import { StatusOrdemServico } from '../domain/status-ordem-servico'

type Request = {
  ordemServicoId: string
}

type Response = {
  id: string
  clienteId: string
  veiculoId: string
  status: StatusOrdemServico
  dataRecebimento: Date
  dataInicio: Date | null
  dataFinalizacao: Date | null
  dataEntrega: Date | null
  servicos: { servicoId: string; nome: string; preco: number }[]
  materiais: {
    materialId: string
    nome: string
    precoUnitario: number
    quantidade: number
    subtotal: number
  }[]
  orcamentos: {
    valor: number
    status: StatusOrcamento
    dataEnvio: Date
    dataResposta: Date | null
  }[]
  total: number
}

@Injectable()
export class GetOrdemServico {
  constructor(private readonly ordemServicoRepository: OrdemServicoRepository) {}

  async execute({ ordemServicoId }: Request): Promise<Response> {
    const ordem = await this.ordemServicoRepository.findById(ordemServicoId)

    if (!ordem) throw new NotFoundError('Ordem de serviço não encontrada.')

    return {
      id: ordem.id,
      clienteId: ordem.clienteId,
      veiculoId: ordem.veiculoId,
      status: ordem.status,
      dataRecebimento: ordem.dataRecebimento,
      dataInicio: ordem.dataInicio,
      dataFinalizacao: ordem.dataFinalizacao,
      dataEntrega: ordem.dataEntrega,
      servicos: ordem.servicos.map(({ servicoId, nome, preco }) => ({
        servicoId,
        nome,
        preco: preco.reais,
      })),
      materiais: ordem.materiais.map(
        ({ materialId, nome, precoUnitario, quantidade, subtotal }) => ({
          materialId,
          nome,
          precoUnitario: precoUnitario.reais,
          quantidade,
          subtotal: subtotal.reais,
        }),
      ),
      orcamentos: ordem.orcamentos.map(({ valor, status, dataEnvio, dataResposta }) => ({
        valor: valor.reais,
        status,
        dataEnvio,
        dataResposta,
      })),
      total: ordem.total.reais,
    }
  }
}

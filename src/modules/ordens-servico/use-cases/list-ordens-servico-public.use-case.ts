import { Injectable } from '@nestjs/common'
import { Documento } from '../../../shared/domain/documento'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import type { Page } from '../../../shared/domain/page'
import { Placa } from '../../../shared/domain/placa'
import { ClienteRepository } from '../../clientes/domain/repositories/cliente.repository'
import { VeiculoRepository } from '../../veiculos/domain/repositories/veiculo.repository'
import { OrdemServicoRepository } from '../domain/repositories/ordem-servico.repository'
import type { StatusOrcamento } from '../domain/status-orcamento'
import type { StatusOrdemServico } from '../domain/status-ordem-servico'

type Request = {
  documento: string
  placa: string
  page: number
  rpp: number
}

type Response = {
  id: string
  numero: number
  status: StatusOrdemServico
  dataRecebimento: Date
  dataInicio: Date | null
  dataFinalizacao: Date | null
  dataEntrega: Date | null
  servicos: { nome: string; preco: number }[]
  materiais: { nome: string; precoUnitario: number; quantidade: number; subtotal: number }[]
  orcamentos: {
    valor: number
    status: StatusOrcamento
    dataEnvio: Date
    dataResposta: Date | null
  }[]
  total: number
}

@Injectable()
export class ListOrdensServicoPublic {
  constructor(
    private readonly ordemServicoRepository: OrdemServicoRepository,
    private readonly clienteRepository: ClienteRepository,
    private readonly veiculoRepository: VeiculoRepository,
  ) {}

  async execute({ documento, placa, page, rpp }: Request): Promise<Page<Response>> {
    const cliente = await this.clienteRepository.findByDocumento(Documento.create(documento))
    const veiculo = await this.veiculoRepository.findByPlaca(Placa.create(placa))
    if (!(cliente && veiculo)) throw new NotFoundError('Ordem de serviço não encontrada.')

    const ordens = await this.ordemServicoRepository.listByClienteAndVeiculo(
      cliente.id,
      veiculo.id,
      page,
      rpp,
    )
    if (ordens.list.length === 0) throw new NotFoundError('Ordem de serviço não encontrada.')

    return ordens.map((ordem) => ({
      id: ordem.id,
      numero: ordem.numero,
      status: ordem.status,
      dataRecebimento: ordem.dataRecebimento,
      dataInicio: ordem.dataInicio,
      dataFinalizacao: ordem.dataFinalizacao,
      dataEntrega: ordem.dataEntrega,
      servicos: ordem.servicos.map((item) => ({ nome: item.nome, preco: item.preco.reais })),
      materiais: ordem.materiais.map((item) => ({
        nome: item.nome,
        precoUnitario: item.precoUnitario.reais,
        quantidade: item.quantidade,
        subtotal: item.subtotal.reais,
      })),
      orcamentos: ordem.orcamentos.map((orcamento) => ({
        valor: orcamento.valor.reais,
        status: orcamento.status,
        dataEnvio: orcamento.dataEnvio,
        dataResposta: orcamento.dataResposta,
      })),
      total: ordem.total.reais,
    }))
  }
}

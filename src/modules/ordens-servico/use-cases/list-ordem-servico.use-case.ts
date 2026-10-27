import { Injectable } from '@nestjs/common'
import { Page } from '../../../shared/domain/page'
import { OrdemServicoRepository } from '../domain/repositories/ordem-servico.repository'
import { StatusOrdemServico } from '../domain/status-ordem-servico'

type Request = {
  page: number
  rpp: number
  status?: StatusOrdemServico
}

type Response = {
  id: string
  clienteId: string
  veiculoId: string
  status: StatusOrdemServico
  dataRecebimento: Date
  total: number
}

@Injectable()
export class ListOrdemServico {
  constructor(private readonly ordemServicoRepository: OrdemServicoRepository) {}

  async execute({ page, rpp, status }: Request): Promise<Page<Response>> {
    const ordens = await this.ordemServicoRepository.list(page, rpp, status)
    return ordens.map((ordem) => ({
      id: ordem.id,
      clienteId: ordem.clienteId,
      veiculoId: ordem.veiculoId,
      status: ordem.status,
      dataRecebimento: ordem.dataRecebimento,
      total: ordem.total.reais,
    }))
  }
}

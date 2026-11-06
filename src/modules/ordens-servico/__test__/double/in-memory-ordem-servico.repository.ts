import { Page } from '../../../../shared/domain/page'
import { OrdemServico } from '../../domain/ordem-servico'
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository'
import type { StatusOrdemServico } from '../../domain/status-ordem-servico'

export class InMemoryOrdemServicoRepository extends OrdemServicoRepository {
  private readonly itens = new Map<string, OrdemServico>()
  tempoMedioExecucaoMinutos: number | null = null

  get ordens(): OrdemServico[] {
    return [...this.itens.values()]
  }

  save(ordem: OrdemServico): Promise<void> {
    if (!this.itens.has(ordem.id)) ordem.atribuirNumero(this.itens.size + 1)
    this.itens.set(ordem.id, ordem)
    return Promise.resolve()
  }

  findById(id: string): Promise<OrdemServico | null> {
    return Promise.resolve(this.itens.get(id) ?? null)
  }

  averageTempoExecucaoMinutos(): Promise<number | null> {
    return Promise.resolve(this.tempoMedioExecucaoMinutos)
  }

  list(page: number, rpp: number, status?: StatusOrdemServico): Promise<Page<OrdemServico>> {
    const filtradas = this.ordens.filter((ordem) => !status || ordem.status === status)
    const list = filtradas.slice((page - 1) * rpp, page * rpp + 1)
    return Promise.resolve(Page.create({ page, rpp, list }))
  }

  listByClienteAndVeiculo(
    clienteId: string,
    veiculoId: string,
    page: number,
    rpp: number,
  ): Promise<Page<OrdemServico>> {
    const ordens = this.ordens
      .filter((ordem) => ordem.clienteId === clienteId && ordem.veiculoId === veiculoId)
      .sort((ordemA, ordemB) => ordemB.dataRecebimento.getTime() - ordemA.dataRecebimento.getTime())
    const list = ordens.slice((page - 1) * rpp, page * rpp + 1)
    return Promise.resolve(Page.create({ page, rpp, list }))
  }
}

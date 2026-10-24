import { randomUUID } from 'node:crypto'
import { Dinheiro } from '../../../shared/domain/dinheiro'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'
import type { ItemMaterial } from './item-material'
import type { ItemServico } from './item-servico'
import { Orcamento } from './orcamento'
import { StatusOrdemServico } from './status-ordem-servico'

export class OrdemServico extends Entity {
  private _status: StatusOrdemServico = StatusOrdemServico.RECEBIDA
  private readonly _servicos: ItemServico[] = []
  private readonly _materiais: ItemMaterial[] = []
  private readonly _orcamentos: Orcamento[] = []
  private _dataInicio: Date | null = null
  private _dataFinalizacao: Date | null = null
  private _dataEntrega: Date | null = null

  private constructor(
    id: string,
    readonly clienteId: string,
    readonly veiculoId: string,
    readonly dataRecebimento: Date,
  ) {
    super(id)
  }

  static create(
    clienteId: string,
    veiculoId: string,
    dataRecebimento: Date = new Date(),
  ): OrdemServico {
    return new OrdemServico(randomUUID(), clienteId, veiculoId, dataRecebimento)
  }

  get status(): StatusOrdemServico {
    return this._status
  }

  get servicos(): readonly ItemServico[] {
    return this._servicos
  }

  get materiais(): readonly ItemMaterial[] {
    return this._materiais
  }

  get orcamentos(): readonly Orcamento[] {
    return this._orcamentos
  }

  get dataInicio(): Date | null {
    return this._dataInicio
  }

  get dataFinalizacao(): Date | null {
    return this._dataFinalizacao
  }

  get dataEntrega(): Date | null {
    return this._dataEntrega
  }

  get total(): Dinheiro {
    const servicos = this._servicos.reduce(
      (total, item) => total.add(item.preco),
      Dinheiro.fromCents(0),
    )
    return this._materiais.reduce((total, item) => total.add(item.subtotal), servicos)
  }

  incluirServico(servico: ItemServico): void {
    this.exigirItensEditaveis()
    if (this._servicos.some((item) => item.servicoId === servico.servicoId)) {
      throw new DomainError('Serviço já incluído.')
    }
    this._servicos.push(servico)
  }

  incluirMaterial(material: ItemMaterial): void {
    this.exigirItensEditaveis()
    const indice = this._materiais.findIndex((item) => item.materialId === material.materialId)
    const existente = this._materiais[indice]
    if (existente) this._materiais[indice] = existente.somar(material.quantidade)
    else this._materiais.push(material)
  }

  iniciarDiagnostico(): void {
    this.exigirStatus(StatusOrdemServico.RECEBIDA)
    this._status = StatusOrdemServico.EM_DIAGNOSTICO
  }

  enviarOrcamento(data: Date = new Date()): void {
    this.exigirStatus(StatusOrdemServico.EM_DIAGNOSTICO)
    if (this._servicos.length === 0) throw new DomainError('Informe ao menos um serviço.')
    this._orcamentos.push(Orcamento.enviar(this.total, data))
    this._status = StatusOrdemServico.AGUARDANDO_APROVACAO
  }

  aprovarOrcamento(data: Date = new Date()): void {
    this.exigirStatus(StatusOrdemServico.AGUARDANDO_APROVACAO)
    this.responderOrcamento((orcamento) => orcamento.aprovar(data))
    this._dataInicio = data
    this._status = StatusOrdemServico.EM_EXECUCAO
  }

  rejeitarOrcamento(data: Date = new Date()): void {
    this.exigirStatus(StatusOrdemServico.AGUARDANDO_APROVACAO)
    this.responderOrcamento((orcamento) => orcamento.rejeitar(data))
    this._status = StatusOrdemServico.EM_DIAGNOSTICO
  }

  finalizar(data: Date = new Date()): void {
    this.exigirStatus(StatusOrdemServico.EM_EXECUCAO)
    this._dataFinalizacao = data
    this._status = StatusOrdemServico.FINALIZADA
  }

  entregar(data: Date = new Date()): void {
    this.exigirStatus(StatusOrdemServico.FINALIZADA)
    this._dataEntrega = data
    this._status = StatusOrdemServico.ENTREGUE
  }

  private responderOrcamento(resposta: (orcamento: Orcamento) => Orcamento): void {
    const vigente = this._orcamentos.length - 1
    this._orcamentos[vigente] = resposta(this._orcamentos[vigente])
  }

  private exigirStatus(esperado: StatusOrdemServico): void {
    if (this._status !== esperado) throw new DomainError('Transição de status inválida.')
  }

  private exigirItensEditaveis(): void {
    const editavel =
      this._status === StatusOrdemServico.RECEBIDA ||
      this._status === StatusOrdemServico.EM_DIAGNOSTICO
    if (!editavel) {
      throw new DomainError('Itens não podem ser alterados após o envio do orçamento.')
    }
  }
}

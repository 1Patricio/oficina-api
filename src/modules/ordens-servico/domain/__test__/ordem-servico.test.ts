import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { DomainError } from '../../../../shared/domain/domain-error'
import { ItemMaterial } from '../item-material'
import { ItemServico } from '../item-servico'
import { Orcamento } from '../orcamento'
import { OrdemServico } from '../ordem-servico'
import { StatusOrcamento } from '../status-orcamento'
import { StatusOrdemServico } from '../status-ordem-servico'

const clienteId = '9c3aea20-5c38-4162-84d9-4e67f461997f'
const veiculoId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'

const troca = ItemServico.create('servico-1', 'Troca de óleo', Dinheiro.fromCents(15000))
const alinhamento = ItemServico.create('servico-2', 'Alinhamento', Dinheiro.fromCents(8000))
const oleo = ItemMaterial.create('material-1', 'Óleo 5W30', Dinheiro.fromCents(3500), 1)
const filtro = ItemMaterial.create('material-2', 'Filtro de óleo', Dinheiro.fromCents(2000), 2)

const dataRecebimento = new Date('2026-10-24T09:00:00.000Z')
const dataEnvio = new Date('2026-10-24T10:00:00.000Z')
const dataResposta = new Date('2026-10-24T11:00:00.000Z')
const dataFinalizacao = new Date('2026-10-24T13:00:00.000Z')
const dataEntrega = new Date('2026-10-24T17:00:00.000Z')

function novaOrdem(): OrdemServico {
  const ordem = OrdemServico.create(clienteId, veiculoId, dataRecebimento)
  ordem.incluirServico(troca)
  return ordem
}

function ordemAguardandoAprovacao(): OrdemServico {
  const ordem = novaOrdem()
  ordem.iniciarDiagnostico()
  ordem.enviarOrcamento(dataEnvio)
  return ordem
}

const transicoesInvalidas: [string, (ordem: OrdemServico) => void][] = [
  [
    'iniciar o diagnóstico duas vezes',
    (ordem) => {
      ordem.iniciarDiagnostico()
      ordem.iniciarDiagnostico()
    },
  ],
  ['enviar o orçamento antes do diagnóstico', (ordem) => ordem.enviarOrcamento()],
  ['aprovar o orçamento antes de enviá-lo', (ordem) => ordem.aprovarOrcamento()],
  ['rejeitar o orçamento antes de enviá-lo', (ordem) => ordem.rejeitarOrcamento()],
  ['finalizar sem ter executado', (ordem) => ordem.finalizar()],
  ['entregar sem ter finalizado', (ordem) => ordem.entregar()],
]

describe('OrdemServico', () => {
  it('nasce recebida, sem itens e com a data de recebimento', () => {
    const ordem = OrdemServico.create(clienteId, veiculoId, dataRecebimento)

    expect(ordem.status).toBe(StatusOrdemServico.RECEBIDA)
    expect(ordem.clienteId).toBe(clienteId)
    expect(ordem.veiculoId).toBe(veiculoId)
    expect(ordem.dataRecebimento).toBe(dataRecebimento)
    expect(ordem.servicos).toHaveLength(0)
    expect(ordem.materiais).toHaveLength(0)
    expect(ordem.total.cents).toBe(0)
  })

  it('calcula o total somando serviços e materiais', () => {
    const ordem = novaOrdem()
    ordem.incluirServico(alinhamento)
    ordem.incluirMaterial(oleo)
    ordem.incluirMaterial(filtro)

    // 15000 + 8000 + (3500 × 1) + (2000 × 2)
    expect(ordem.total.cents).toBe(30500)
  })

  it('soma a quantidade ao incluir um material já incluído', () => {
    const ordem = novaOrdem()
    ordem.incluirMaterial(oleo)
    ordem.incluirMaterial(oleo)

    expect(ordem.materiais).toHaveLength(1)
    expect(ordem.materiais[0].quantidade).toBe(2)
    expect(ordem.total.cents).toBe(22000)
  })

  it('rejeita incluir o mesmo serviço duas vezes', () => {
    expect(() => novaOrdem().incluirServico(troca)).toThrow(DomainError)
  })

  it('rejeita enviar o orçamento sem itens', () => {
    const ordem = OrdemServico.create(clienteId, veiculoId)
    ordem.iniciarDiagnostico()

    expect(() => ordem.enviarOrcamento()).toThrow(DomainError)
  })

  it('envia o orçamento só com materiais', () => {
    const ordem = OrdemServico.create(clienteId, veiculoId)
    ordem.incluirMaterial(oleo)
    ordem.iniciarDiagnostico()
    ordem.enviarOrcamento(dataEnvio)

    expect(ordem.orcamentos[0].valor.cents).toBe(3500)
  })

  it('envia o orçamento pendente com o total e a data de envio', () => {
    const ordem = ordemAguardandoAprovacao()

    expect(ordem.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO)
    expect(ordem.orcamentos).toHaveLength(1)
    expect(ordem.orcamentos[0]).toMatchObject({
      status: StatusOrcamento.PENDENTE,
      dataEnvio,
      dataResposta: null,
    })
    expect(ordem.orcamentos[0].valor.cents).toBe(15000)
  })

  it('aprova o orçamento e inicia a execução', () => {
    const ordem = ordemAguardandoAprovacao()

    ordem.aprovarOrcamento(dataResposta)

    expect(ordem.status).toBe(StatusOrdemServico.EXECUCAO)
    expect(ordem.dataInicio).toBe(dataResposta)
    expect(ordem.orcamentos[0]).toMatchObject({ status: StatusOrcamento.APROVADO, dataResposta })
  })

  it('volta ao diagnóstico ao rejeitar o orçamento', () => {
    const ordem = ordemAguardandoAprovacao()

    ordem.rejeitarOrcamento(dataResposta)

    expect(ordem.status).toBe(StatusOrdemServico.DIAGNOSTICO)
    expect(ordem.dataInicio).toBeNull()
    expect(ordem.orcamentos[0]).toMatchObject({ status: StatusOrcamento.REJEITADO, dataResposta })
  })

  it('gera um novo orçamento ao reenviar depois de revisar os itens', () => {
    const ordem = ordemAguardandoAprovacao()
    ordem.rejeitarOrcamento(dataResposta)

    ordem.incluirServico(alinhamento)
    ordem.enviarOrcamento(dataEnvio)

    expect(ordem.orcamentos).toHaveLength(2)
    expect(ordem.orcamentos[0].status).toBe(StatusOrcamento.REJEITADO)
    expect(ordem.orcamentos[1].status).toBe(StatusOrcamento.PENDENTE)
    expect(ordem.orcamentos[1].valor.cents).toBe(23000)
  })

  it('bloqueia alterar os itens depois do envio do orçamento', () => {
    const ordem = ordemAguardandoAprovacao()

    expect(() => ordem.incluirServico(alinhamento)).toThrow(DomainError)
    expect(() => ordem.incluirMaterial(oleo)).toThrow(DomainError)
  })

  it('percorre os status até a entrega registrando as datas', () => {
    const ordem = novaOrdem()

    ordem.iniciarDiagnostico()
    expect(ordem.status).toBe(StatusOrdemServico.DIAGNOSTICO)

    ordem.enviarOrcamento(dataEnvio)
    expect(ordem.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO)

    ordem.aprovarOrcamento(dataResposta)
    expect(ordem.status).toBe(StatusOrdemServico.EXECUCAO)

    ordem.finalizar(dataFinalizacao)
    expect(ordem.status).toBe(StatusOrdemServico.FINALIZADA)
    expect(ordem.dataFinalizacao).toBe(dataFinalizacao)

    ordem.entregar(dataEntrega)
    expect(ordem.status).toBe(StatusOrdemServico.ENTREGUE)
    expect(ordem.dataEntrega).toBe(dataEntrega)
  })

  it.each(transicoesInvalidas)('recusa %s', (_descricao, acao) => {
    expect(() => acao(novaOrdem())).toThrow(DomainError)
  })

  it('restaura o estado completo sem passar pelas transições', () => {
    const id = '3b2a1c0d-9e8f-4a7b-8c6d-5e4f3a2b1c0d'
    const aprovado = Orcamento.restore(
      Dinheiro.fromCents(18500),
      StatusOrcamento.APROVADO,
      dataEnvio,
      dataResposta,
    )

    const ordem = OrdemServico.restore({
      id,
      clienteId,
      veiculoId,
      status: StatusOrdemServico.EXECUCAO,
      dataRecebimento,
      dataInicio: dataResposta,
      dataFinalizacao: null,
      dataEntrega: null,
      servicos: [troca],
      materiais: [oleo],
      orcamentos: [aprovado],
    })

    expect(ordem).toMatchObject({
      id,
      clienteId,
      veiculoId,
      status: StatusOrdemServico.EXECUCAO,
      dataRecebimento,
      dataInicio: dataResposta,
      dataFinalizacao: null,
      dataEntrega: null,
    })
    expect(ordem.servicos).toEqual([troca])
    expect(ordem.materiais).toEqual([oleo])
    expect(ordem.orcamentos).toEqual([aprovado])
    expect(ordem.total.cents).toBe(18500)
  })
})

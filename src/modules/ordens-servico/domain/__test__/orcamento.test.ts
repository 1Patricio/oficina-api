import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { DomainError } from '../../../../shared/domain/domain-error'
import { Orcamento } from '../orcamento'
import { StatusOrcamento } from '../status-orcamento'

const valor = Dinheiro.fromCents(15000)
const dataEnvio = new Date('2026-10-24T10:00:00.000Z')
const dataResposta = new Date('2026-10-24T11:00:00.000Z')

describe('Orcamento', () => {
  it('nasce pendente com o valor e a data de envio', () => {
    const orcamento = Orcamento.enviar(valor, dataEnvio)

    expect(orcamento).toMatchObject({
      valor,
      status: StatusOrcamento.PENDENTE,
      dataEnvio,
      dataResposta: null,
    })
  })

  it('registra a aprovação com a data da resposta sem alterar o original', () => {
    const pendente = Orcamento.enviar(valor, dataEnvio)

    const aprovado = pendente.aprovar(dataResposta)

    expect(aprovado).toMatchObject({ status: StatusOrcamento.APROVADO, dataEnvio, dataResposta })
    expect(pendente.status).toBe(StatusOrcamento.PENDENTE)
  })

  it('registra a rejeição com a data da resposta', () => {
    const rejeitado = Orcamento.enviar(valor, dataEnvio).rejeitar(dataResposta)

    expect(rejeitado).toMatchObject({ status: StatusOrcamento.REJEITADO, dataEnvio, dataResposta })
  })

  it('não aceita uma segunda resposta', () => {
    const aprovado = Orcamento.enviar(valor, dataEnvio).aprovar(dataResposta)

    expect(() => aprovado.rejeitar(dataResposta)).toThrow(DomainError)
  })
})

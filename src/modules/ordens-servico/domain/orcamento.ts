import type { Dinheiro } from '../../../shared/domain/dinheiro'
import { DomainError } from '../../../shared/domain/domain-error'
import { StatusOrcamento } from './status-orcamento'

export class Orcamento {
  private constructor(
    readonly valor: Dinheiro,
    readonly status: StatusOrcamento,
    readonly dataEnvio: Date,
    readonly dataResposta: Date | null,
  ) {}

  static enviar(valor: Dinheiro, dataEnvio: Date): Orcamento {
    return new Orcamento(valor, StatusOrcamento.PENDENTE, dataEnvio, null)
  }

  aprovar(dataResposta: Date): Orcamento {
    return this.responder(StatusOrcamento.APROVADO, dataResposta)
  }

  rejeitar(dataResposta: Date): Orcamento {
    return this.responder(StatusOrcamento.REJEITADO, dataResposta)
  }

  private responder(status: StatusOrcamento, dataResposta: Date): Orcamento {
    if (this.status !== StatusOrcamento.PENDENTE) throw new DomainError('Orçamento já respondido.')
    return new Orcamento(this.valor, status, this.dataEnvio, dataResposta)
  }
}

import { Injectable } from '@nestjs/common'
import { EnsureOrdemServicoCliente } from './ensure-ordem-servico-cliente'
import { RejeitarOrcamento } from './rejeitar-orcamento.use-case'

type Request = {
  ordemServicoId: string
  documento: string
  placa: string
}

@Injectable()
export class RejeitarOrcamentoPublic {
  constructor(
    private readonly ensureOrdemServicoCliente: EnsureOrdemServicoCliente,
    private readonly rejeitarOrcamento: RejeitarOrcamento,
  ) {}

  async execute({ ordemServicoId, documento, placa }: Request): Promise<void> {
    await this.ensureOrdemServicoCliente.execute({ ordemServicoId, documento, placa })
    await this.rejeitarOrcamento.execute({ ordemServicoId })
  }
}

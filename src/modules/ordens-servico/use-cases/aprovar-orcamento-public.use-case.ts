import { Injectable } from '@nestjs/common'
import { AprovarOrcamento } from './aprovar-orcamento.use-case'
import { EnsureOrdemServicoCliente } from './ensure-ordem-servico-cliente'

type Request = {
  ordemServicoId: string
  documento: string
  placa: string
}

@Injectable()
export class AprovarOrcamentoPublic {
  constructor(
    private readonly ensureOrdemServicoCliente: EnsureOrdemServicoCliente,
    private readonly aprovarOrcamento: AprovarOrcamento,
  ) {}

  async execute({ ordemServicoId, documento, placa }: Request): Promise<void> {
    await this.ensureOrdemServicoCliente.execute({ ordemServicoId, documento, placa })
    await this.aprovarOrcamento.execute({ ordemServicoId })
  }
}

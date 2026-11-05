import { Injectable } from '@nestjs/common'
import { OrdemServicoRepository } from '../domain/repositories/ordem-servico.repository'

type Response = {
  tempoMedioMinutos: number | null
}

@Injectable()
export class GetTempoMedio {
  constructor(private readonly ordemServicoRepository: OrdemServicoRepository) {}

  async execute(): Promise<Response> {
    const tempoMedio = await this.ordemServicoRepository.averageTempoExecucaoMinutos()
    return { tempoMedioMinutos: tempoMedio === null ? null : Math.round(tempoMedio) }
  }
}

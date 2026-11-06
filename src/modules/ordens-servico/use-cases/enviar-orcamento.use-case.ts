import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { OrdemServicoRepository } from '../domain/repositories/ordem-servico.repository'
import { NotificarOrcamentoCliente } from './notificar-orcamento-cliente'

type Request = {
  ordemServicoId: string
}

@Injectable()
export class EnviarOrcamento {
  constructor(
    private readonly ordemServicoRepository: OrdemServicoRepository,
    private readonly notificarOrcamentoCliente: NotificarOrcamentoCliente,
  ) {}

  async execute({ ordemServicoId }: Request): Promise<void> {
    const ordem = await this.ordemServicoRepository.findById(ordemServicoId)
    if (!ordem) throw new NotFoundError('Ordem de serviço não encontrada.')

    ordem.enviarOrcamento()
    await this.ordemServicoRepository.save(ordem)
    await this.notificarOrcamentoCliente.execute(ordem, ordem.total)
  }
}

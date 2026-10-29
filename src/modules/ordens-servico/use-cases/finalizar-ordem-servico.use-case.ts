import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { OrdemServicoRepository } from '../domain/repositories/ordem-servico.repository'

type Request = {
  ordemServicoId: string
}

@Injectable()
export class FinalizarOrdemServico {
  constructor(private readonly ordemServicoRepository: OrdemServicoRepository) {}

  async execute({ ordemServicoId }: Request): Promise<void> {
    const ordem = await this.ordemServicoRepository.findById(ordemServicoId)
    if (!ordem) throw new NotFoundError('Ordem de serviço não encontrada.')

    ordem.finalizar()
    await this.ordemServicoRepository.save(ordem)
  }
}

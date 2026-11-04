import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { ServicoRepository } from '../domain/repositories/servico.repository'

type Request = {
  servicoId: string
}

@Injectable()
export class DeleteServico {
  constructor(private readonly servicoRepository: ServicoRepository) {}

  async execute({ servicoId }: Request): Promise<void> {
    const servico = await this.servicoRepository.findById(servicoId)

    if (!servico) throw new NotFoundError('Serviço não encontrado.')

    servico.delete()
    await this.servicoRepository.save(servico)
  }
}

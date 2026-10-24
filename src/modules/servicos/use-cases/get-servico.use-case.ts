import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { ServicoRepository } from '../domain/repositories/servico.repository'

type Request = {
  servicoId: string
}

type Response = {
  id: string
  nome: string
  descricao: string
  preco: number
  materiais: { materialId: string; quantidade: number }[]
}

@Injectable()
export class GetServico {
  constructor(private servicoRepository: ServicoRepository) {}

  async execute({ servicoId }: Request): Promise<Response> {
    const servico = await this.servicoRepository.findById(servicoId)

    if (!servico) throw new NotFoundError('Serviço não encontrado.')

    return {
      id: servico.id,
      nome: servico.nome,
      descricao: servico.descricao,
      preco: servico.preco.reais,
      materiais: servico.materiais.map(({ materialId, quantidade }) => ({
        materialId,
        quantidade,
      })),
    }
  }
}

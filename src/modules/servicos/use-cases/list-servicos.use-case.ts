import { Injectable } from '@nestjs/common'
import type { Page } from '../../../shared/domain/page'
import { ServicoRepository } from '../domain/repositories/servico.repository'

type Request = {
  page: number
  rpp: number
  term?: string
}

type Response = {
  id: string
  nome: string
  descricao: string
  preco: number
  materiais: { materialId: string; quantidade: number }[]
}

@Injectable()
export class ListServicos {
  constructor(private readonly servicoRepository: ServicoRepository) {}

  async execute({ page, rpp, term }: Request): Promise<Page<Response>> {
    const servicos = await this.servicoRepository.list(page, rpp, term)
    return servicos.map((servico) => ({
      id: servico.id,
      nome: servico.nome,
      descricao: servico.descricao,
      preco: servico.preco.reais,
      materiais: servico.materiais.map(({ materialId, quantidade }) => ({
        materialId,
        quantidade,
      })),
    }))
  }
}

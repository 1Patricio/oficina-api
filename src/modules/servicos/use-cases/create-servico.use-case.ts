import { Injectable } from '@nestjs/common'
import { Dinheiro } from '../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { MaterialRepository } from '../../estoque/domain/repositories/material.repository'
import { MaterialNecessario } from '../domain/material-necessario'
import { ServicoRepository } from '../domain/repositories/servico.repository'
import { Servico } from '../domain/servico'

type Request = {
  nome: string
  descricao: string
  preco: number
  materiais?: { materialId: string; quantidade: number }[]
}

type Response = {
  id: string
}

@Injectable()
export class CreateServico {
  constructor(
    private readonly servicoRepository: ServicoRepository,
    private readonly materialRepository: MaterialRepository,
  ) {}

  async execute({ nome, descricao, preco, materiais = [] }: Request): Promise<Response> {
    const servico = Servico.create(
      nome,
      descricao,
      Dinheiro.fromReais(preco),
      materiais.map(({ materialId, quantidade }) =>
        MaterialNecessario.create(materialId, quantidade),
      ),
    )
    const materialIds = servico.materiais.map((material) => material.materialId)
    const existingMateriais = await this.materialRepository.findManyByIds(materialIds)

    if (existingMateriais.length !== materialIds.length) {
      throw new NotFoundError('Material não encontrado.')
    }

    await this.servicoRepository.save(servico)
    return { id: servico.id }
  }
}

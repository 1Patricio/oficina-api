import { Injectable } from '@nestjs/common'
import { Dinheiro } from '../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { MaterialRepository } from '../../estoque/domain/repositories/material.repository'
import { MaterialNecessario } from '../domain/material-necessario'
import { ServicoRepository } from '../domain/repositories/servico.repository'

type Request = {
  servicoId: string
  nome: string
  descricao: string
  preco: number
  materiais?: { materialId: string; quantidade: number }[]
}

@Injectable()
export class UpdateServico {
  constructor(
    private readonly servicoRepository: ServicoRepository,
    private readonly materialRepository: MaterialRepository,
  ) {}

  async execute({ servicoId, nome, descricao, preco, materiais = [] }: Request): Promise<void> {
    const servico = await this.servicoRepository.findById(servicoId)

    if (!servico) throw new NotFoundError('Serviço não encontrado.')

    servico.update(
      nome,
      descricao,
      Dinheiro.fromReais(preco),
      materiais.map((material) =>
        MaterialNecessario.create(material.materialId, material.quantidade),
      ),
    )

    const materialIds = servico.materiais.map((material) => material.materialId)
    const existingMateriais = await this.materialRepository.findManyByIds(materialIds)

    if (existingMateriais.length !== materialIds.length) {
      throw new NotFoundError('Material não encontrado.')
    }

    await this.servicoRepository.save(servico)
  }
}

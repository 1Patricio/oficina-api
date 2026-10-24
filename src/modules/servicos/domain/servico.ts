import { randomUUID } from 'node:crypto'
import type { Dinheiro } from '../../../shared/domain/dinheiro'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'
import type { MaterialNecessario } from './material-necessario'

export class Servico extends Entity {
  private constructor(
    id: string,
    readonly nome: string,
    readonly descricao: string,
    readonly preco: Dinheiro,
    readonly materiais: readonly MaterialNecessario[],
  ) {
    super(id)
    if (nome.trim() === '') throw new DomainError('Nome não informado.')
    const materialIds = new Set(materiais.map((material) => material.materialId))
    if (materialIds.size !== materiais.length) throw new DomainError('Material duplicado.')
  }

  static create(
    nome: string,
    descricao: string,
    preco: Dinheiro,
    materiais: MaterialNecessario[] = [],
  ): Servico {
    return new Servico(randomUUID(), nome, descricao, preco, materiais)
  }

  static restore(
    id: string,
    nome: string,
    descricao: string,
    preco: Dinheiro,
    materiais: MaterialNecessario[],
  ): Servico {
    return new Servico(id, nome, descricao, preco, materiais)
  }
}

import { randomUUID } from 'crypto'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'

export class Servico extends Entity {
  private constructor(
    id: string,
    readonly nome: string,
    readonly descrição: string,
  ) {
    super(id)
    if (nome === '') throw new DomainError('Nome não informado.')
  }

  static create(nome: string, descrição: string): Servico {
    return new Servico(randomUUID(), nome, descrição)
  }

  static restore(id: string, nome: string, descrição: string): Servico {
    return new Servico(id, nome, descrição)
  }
}

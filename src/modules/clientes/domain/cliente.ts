import { randomUUID } from 'node:crypto'
import { Documento } from '../../../shared/domain/documento'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'

export class Cliente extends Entity {
  private constructor(
    id: string,
    readonly documento: Documento,
    readonly nome: string,
  ) {
    super(id)
    if (nome.trim() === '') throw new DomainError('Nome não informado.')
  }

  static create(documento: Documento, nome: string): Cliente {
    return new Cliente(randomUUID(), documento, nome)
  }

  static restore(id: string, documento: Documento, nome: string): Cliente {
    return new Cliente(id, documento, nome)
  }
}

import { randomUUID } from 'node:crypto'
import { Documento } from '../../../shared/domain/documento'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'

export class Cliente extends Entity {
  private constructor(
    id: string,
    private _documento: Documento,
    private _nome: string,
    private _email: string | null,
    private _deletedAt: Date | null,
  ) {
    super(id)
    validateNome(_nome)
  }

  static create(documento: Documento, nome: string, email: string): Cliente {
    return new Cliente(randomUUID(), documento, nome, email, null)
  }

  static restore(
    id: string,
    documento: Documento,
    nome: string,
    email: string | null,
    deletedAt: Date | null,
  ): Cliente {
    return new Cliente(id, documento, nome, email, deletedAt)
  }

  get documento(): Documento {
    return this._documento
  }

  get nome(): string {
    return this._nome
  }

  get email(): string | null {
    return this._email
  }

  get deletedAt(): Date | null {
    return this._deletedAt
  }

  update(documento: Documento, nome: string, email: string): void {
    validateNome(nome)

    this._documento = documento
    this._nome = nome
    this._email = email
  }

  delete(data: Date = new Date()): void {
    this._deletedAt = data
  }
}

function validateNome(nome: string): void {
  if (nome.trim() === '') throw new DomainError('Nome não informado.')
}

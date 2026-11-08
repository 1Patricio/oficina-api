import { randomUUID } from 'node:crypto'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'

export class Usuario extends Entity {
  private constructor(
    id: string,
    private readonly _nome: string,
    private readonly _email: string,
    private readonly _senha: string,
  ) {
    super(id)
    if (_nome.trim() === '') throw new DomainError('Nome não informado.')
    if (_email.trim() === '') throw new DomainError('E-mail não informado.')
    if (_senha.trim() === '') throw new DomainError('Senha não informada.')
  }

  static create(nome: string, email: string, senha: string): Usuario {
    return new Usuario(randomUUID(), nome, email.trim().toLowerCase(), senha)
  }

  static restore(id: string, nome: string, email: string, senha: string): Usuario {
    return new Usuario(id, nome, email, senha)
  }

  get nome(): string {
    return this._nome
  }

  get email(): string {
    return this._email
  }

  get senha(): string {
    return this._senha
  }
}

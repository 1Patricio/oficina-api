import { randomUUID } from 'node:crypto'
import { Dinheiro } from '../../../shared/domain/dinheiro'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'

export class Material extends Entity {
  private constructor(
    id: string,
    private _nome: string,
    private _precoUnitario: Dinheiro,
    private _estoque: number,
    private _deletedAt: Date | null,
  ) {
    super(id)
    validateNome(_nome)
    validateEstoque(_estoque)
  }

  static create(nome: string, precoUnitario: Dinheiro, estoque: number): Material {
    return new Material(randomUUID(), nome, precoUnitario, estoque, null)
  }

  static restore(
    id: string,
    nome: string,
    precoUnitario: Dinheiro,
    estoque: number,
    deletedAt: Date | null,
  ): Material {
    return new Material(id, nome, precoUnitario, estoque, deletedAt)
  }

  get nome(): string {
    return this._nome
  }

  get precoUnitario(): Dinheiro {
    return this._precoUnitario
  }

  get estoque(): number {
    return this._estoque
  }

  get deletedAt(): Date | null {
    return this._deletedAt
  }

  update(nome: string, precoUnitario: Dinheiro, estoque: number): void {
    validateNome(nome)
    validateEstoque(estoque)

    this._nome = nome
    this._precoUnitario = precoUnitario
    this._estoque = estoque
  }

  removeEstoque(quantidade: number): void {
    validateQuantidade(quantidade)
    if (quantidade > this._estoque) {
      throw new DomainError(`Estoque insuficiente: ${this.nome}`)
    }
    this._estoque -= quantidade
  }

  addEstoque(quantidade: number): void {
    validateQuantidade(quantidade)
    this._estoque += quantidade
  }

  delete(data: Date = new Date()): void {
    this._deletedAt = data
  }
}

function validateNome(nome: string): void {
  if (nome.trim() === '') throw new DomainError('Nome não informado.')
}

function validateEstoque(estoque: number): void {
  if (!Number.isSafeInteger(estoque) || estoque < 0) throw new DomainError('Estoque inválido.')
}

function validateQuantidade(quantidade: number): void {
  if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
    throw new DomainError('Quantidade inválida.')
  }
}

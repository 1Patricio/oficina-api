import { randomUUID } from 'node:crypto'
import { Dinheiro } from '../../../shared/domain/dinheiro'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'

export class Material extends Entity {
  private constructor(
    id: string,
    readonly nome: string,
    readonly precoUnitario: Dinheiro,
    private _estoque: number,
  ) {
    super(id)
    if (nome.trim() === '') throw new DomainError('Nome não informado.')
    if (!Number.isSafeInteger(_estoque) || _estoque < 0) throw new DomainError('Estoque inválido.')
  }

  static create(nome: string, precoUnitario: Dinheiro, estoque: number): Material {
    return new Material(randomUUID(), nome, precoUnitario, estoque)
  }

  static restore(id: string, nome: string, precoUnitario: Dinheiro, estoque: number): Material {
    return new Material(id, nome, precoUnitario, estoque)
  }

  get estoque(): number {
    return this._estoque
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
}

function validateQuantidade(quantidade: number): void {
  if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
    throw new DomainError('Quantidade inválida.')
  }
}

import { randomUUID } from 'node:crypto'
import type { Dinheiro } from '../../../shared/domain/dinheiro'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'
import type { MaterialNecessario } from './material-necessario'

export class Servico extends Entity {
  private constructor(
    id: string,
    private _nome: string,
    private _descricao: string,
    private _preco: Dinheiro,
    private _materiais: readonly MaterialNecessario[],
  ) {
    super(id)
    validateNome(_nome)
    validateMateriais(_materiais)
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

  get nome(): string {
    return this._nome
  }

  get descricao(): string {
    return this._descricao
  }

  get preco(): Dinheiro {
    return this._preco
  }

  get materiais(): readonly MaterialNecessario[] {
    return this._materiais
  }

  update(
    nome: string,
    descricao: string,
    preco: Dinheiro,
    materiais: readonly MaterialNecessario[],
  ): void {
    validateNome(nome)
    validateMateriais(materiais)

    this._nome = nome
    this._descricao = descricao
    this._preco = preco
    this._materiais = materiais
  }
}

function validateNome(nome: string): void {
  if (nome.trim() === '') throw new DomainError('Nome não informado.')
}

function validateMateriais(materiais: readonly MaterialNecessario[]): void {
  const materialIds = new Set(materiais.map((material) => material.materialId))
  if (materialIds.size !== materiais.length) throw new DomainError('Material duplicado.')
}

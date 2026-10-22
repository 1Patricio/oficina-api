import { randomUUID } from 'node:crypto'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'

export class Veiculo extends Entity {
  private constructor(
    id: string,
    readonly ano: number,
    readonly marca: string,
    readonly modelo: string,
  ) {
    super(id)
    if (marca.trim() === '') throw new DomainError('Marca não informada.')
    if (modelo.trim() === '') throw new DomainError('Modelo não informado.')
  }

  static create(ano: number, marca: string, modelo: string): Veiculo {
    return new Veiculo(randomUUID(), ano, marca, modelo)
  }
}

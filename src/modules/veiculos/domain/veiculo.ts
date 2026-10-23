import { randomUUID } from 'node:crypto'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'
import { Placa } from '../../../shared/domain/placa'

export class Veiculo extends Entity {
  private constructor(
    id: string,
    readonly placa: Placa,
    readonly ano: number,
    readonly marca: string,
    readonly modelo: string,
  ) {
    super(id)
    if (marca.trim() === '') throw new DomainError('Marca não informada.')
    if (modelo.trim() === '') throw new DomainError('Modelo não informado.')
  }

  static create(placa: Placa, ano: number, marca: string, modelo: string): Veiculo {
    return new Veiculo(randomUUID(), placa, ano, marca, modelo)
  }

  static restore(id: string, placa: Placa, ano: number, marca: string, modelo: string): Veiculo {
    return new Veiculo(id, placa, ano, marca, modelo)
  }
}

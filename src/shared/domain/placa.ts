import { isCarPlate } from 'validation-br'
import { DomainError } from './domain-error'

export class Placa {
  private constructor(readonly value: string) {}

  static create(value: string): Placa {
    if (!isCarPlate(value)) throw new DomainError('Placa inválida.')
    return new Placa(value.replace('-', '').trim().toUpperCase())
  }

  equals(other: Placa): boolean {
    return this.value === other.value
  }
}

import { isCNPJ, isCPF } from 'validation-br'
import { DomainError } from './domain-error'

export class Documento {
  private constructor(readonly value: string) {}

  static create(value: string): Documento {
    if (!(isCPF(value) || isCNPJ(value))) throw new DomainError('Documento inválido.')
    return new Documento(value.replace(/[./\s-]/g, '').toUpperCase())
  }

  equals(other: Documento): boolean {
    return this.value === other.value
  }
}

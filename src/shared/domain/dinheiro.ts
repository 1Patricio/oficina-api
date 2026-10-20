import { DomainError } from './domain-error'

export class Dinheiro {
  private constructor(readonly cents: number) {
    if (!Number.isSafeInteger(cents) || cents < 0) {
      throw new DomainError('Valor inválido.')
    }
  }

  static fromCents(cents: number): Dinheiro {
    return new Dinheiro(cents)
  }

  add(other: Dinheiro): Dinheiro {
    return new Dinheiro(this.cents + other.cents)
  }

  multiply(quantity: number): Dinheiro {
    return new Dinheiro(Math.round(this.cents * quantity))
  }

  equals(other: Dinheiro): boolean {
    return this.cents === other.cents
  }
}

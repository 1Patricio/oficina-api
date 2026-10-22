import { Dinheiro } from '../dinheiro'
import { DomainError } from '../domain-error'

describe('Dinheiro', () => {
  it('guarda o valor em centavos', () => {
    expect(Dinheiro.fromCents(1999).cents).toBe(1999)
  })

  it('aceita zero', () => {
    expect(Dinheiro.fromCents(0).cents).toBe(0)
  })

  it('rejeita valor negativo', () => {
    expect(() => Dinheiro.fromCents(-1)).toThrow(DomainError)
  })

  it('rejeita fração de centavo', () => {
    expect(() => Dinheiro.fromCents(10.5)).toThrow(DomainError)
  })

  it('converte reais em centavos', () => {
    expect(Dinheiro.fromReais(45.9).cents).toBe(4590)
  })

  it('não perde centavo por ponto flutuante', () => {
    expect(Dinheiro.fromReais(1.15).cents).toBe(115)
    expect(Dinheiro.fromReais(0.1 + 0.2).cents).toBe(30)
  })

  it('aceita zero reais', () => {
    expect(Dinheiro.fromReais(0).cents).toBe(0)
  })

  it('rejeita reais negativos', () => {
    expect(() => Dinheiro.fromReais(-1)).toThrow(DomainError)
  })

  it('rejeita reais com mais de duas casas decimais', () => {
    expect(() => Dinheiro.fromReais(45.905)).toThrow(DomainError)
  })

  it('rejeita reais que não são número finito', () => {
    expect(() => Dinheiro.fromReais(Number.NaN)).toThrow(DomainError)
    expect(() => Dinheiro.fromReais(Number.POSITIVE_INFINITY)).toThrow(DomainError)
  })

  it('soma dois valores', () => {
    const total = Dinheiro.fromCents(1050).add(Dinheiro.fromCents(250))
    expect(total.cents).toBe(1300)
  })

  it('multiplica pela quantidade', () => {
    expect(Dinheiro.fromCents(1999).multiply(3).cents).toBe(5997)
  })

  it('arredonda ao multiplicar por quantidade fracionada', () => {
    expect(Dinheiro.fromCents(3333).multiply(1.5).cents).toBe(5000)
  })

  it('igual a outro com o mesmo valor', () => {
    expect(Dinheiro.fromCents(100).equals(Dinheiro.fromCents(100))).toBe(true)
  })

  it('diferente de outro com valor diferente', () => {
    expect(Dinheiro.fromCents(100).equals(Dinheiro.fromCents(200))).toBe(false)
  })
})

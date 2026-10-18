import { Dinheiro } from '../dinheiro'

describe('Dinheiro', () => {
  it('guarda o valor em centavos', () => {
    expect(Dinheiro.fromCents(1999).cents).toBe(1999)
  })

  it('aceita zero', () => {
    expect(Dinheiro.fromCents(0).cents).toBe(0)
  })

  it('rejeita valor negativo', () => {
    expect(() => Dinheiro.fromCents(-1)).toThrow()
  })

  it('rejeita fração de centavo', () => {
    expect(() => Dinheiro.fromCents(10.5)).toThrow()
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

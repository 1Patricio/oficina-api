import { DomainError } from '../domain-error'
import { Placa } from '../placa'

describe('Placa', () => {
  it('normaliza removendo o hífen e usando maiúsculas', () => {
    expect(Placa.create('abc-1234').value).toBe('ABC1234')
  })

  it('rejeita placa inválida', () => {
    expect(() => Placa.create('ABC123')).toThrow(DomainError)
  })

  it('igual a outra com o mesmo valor', () => {
    expect(Placa.create('abc-1234').equals(Placa.create('ABC1234'))).toBe(true)
  })

  it('diferente de outra com valor diferente', () => {
    expect(Placa.create('ABC1234').equals(Placa.create('ABC1D23'))).toBe(false)
  })
})

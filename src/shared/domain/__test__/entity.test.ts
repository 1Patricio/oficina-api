import { Entity } from '../entity'

class Carro extends Entity {}
class Moto extends Entity {}

describe('Entity', () => {
  it('igual a outra do mesmo tipo com o mesmo id', () => {
    expect(new Carro('1').equals(new Carro('1'))).toBe(true)
  })

  it('diferente de outra do mesmo tipo com id diferente', () => {
    expect(new Carro('1').equals(new Carro('2'))).toBe(false)
  })

  it('diferente de outra de tipo diferente com o mesmo id', () => {
    expect(new Carro('1').equals(new Moto('1'))).toBe(false)
  })
})

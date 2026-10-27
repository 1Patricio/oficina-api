import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { DomainError } from '../../../../shared/domain/domain-error'
import { ItemMaterial } from '../item-material'

const preco = Dinheiro.fromCents(2000)

describe('ItemMaterial', () => {
  it('calcula o subtotal pelo preço unitário e a quantidade', () => {
    const filtro = ItemMaterial.create('material-1', 'Filtro de óleo', preco, 3)

    expect(filtro.subtotal.cents).toBe(6000)
  })

  it('rejeita quantidade inválida', () => {
    expect(() => ItemMaterial.create('material-1', 'Filtro de óleo', preco, 0)).toThrow(DomainError)
    expect(() => ItemMaterial.create('material-1', 'Filtro de óleo', preco, -1)).toThrow(
      DomainError,
    )
    expect(() => ItemMaterial.create('material-1', 'Filtro de óleo', preco, 1.5)).toThrow(
      DomainError,
    )
  })

  it('soma a quantidade mantendo o preço registrado', () => {
    const filtro = ItemMaterial.create('material-1', 'Filtro de óleo', preco, 1)

    const somado = filtro.somar(2)

    expect(somado.quantidade).toBe(3)
    expect(somado.precoUnitario).toBe(preco)
    expect(filtro.quantidade).toBe(1)
  })
})

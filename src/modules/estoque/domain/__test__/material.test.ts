import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { DomainError } from '../../../../shared/domain/domain-error'
import { Material } from '../material'

const preco = Dinheiro.fromCents(4590)

function criarFiltro(estoque = 10) {
  return Material.create('Filtro de óleo', preco, estoque)
}

describe('Material', () => {
  it('cria com nome, preço unitário e estoque inicial', () => {
    const material = criarFiltro(10)
    expect(material.nome).toBe('Filtro de óleo')
    expect(material.precoUnitario.equals(preco)).toBe(true)
    expect(material.estoque).toBe(10)
  })

  it('gera um id diferente para cada material', () => {
    expect(criarFiltro().id).not.toBe(criarFiltro().id)
  })

  it('rejeita nome vazio', () => {
    expect(() => Material.create('  ', preco, 10)).toThrow(DomainError)
  })

  it('aceita estoque inicial zero', () => {
    expect(criarFiltro(0).estoque).toBe(0)
  })

  it('rejeita estoque negativo', () => {
    expect(() => criarFiltro(-1)).toThrow(DomainError)
  })

  it('rejeita estoque fracionado', () => {
    expect(() => criarFiltro(1.5)).toThrow(DomainError)
  })

  it('restaura com o id e os dados informados', () => {
    const id = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
    const material = Material.restore(id, 'Filtro de óleo', preco, 5)
    expect(material.id).toBe(id)
    expect(material.nome).toBe('Filtro de óleo')
    expect(material.precoUnitario.equals(preco)).toBe(true)
    expect(material.estoque).toBe(5)
  })

  it('rejeita restaurar com dados inválidos', () => {
    const id = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
    expect(() => Material.restore(id, '  ', preco, 5)).toThrow(DomainError)
    expect(() => Material.restore(id, 'Filtro de óleo', preco, -1)).toThrow(
      DomainError,
    )
  })

  it('remove do estoque', () => {
    const material = criarFiltro(10)
    material.removeEstoque(3)
    expect(material.estoque).toBe(7)
  })

  it('remove todo o estoque', () => {
    const material = criarFiltro(10)
    material.removeEstoque(10)
    expect(material.estoque).toBe(0)
  })

  it('rejeita remover mais que o disponível', () => {
    const material = criarFiltro(2)
    expect(() => material.removeEstoque(3)).toThrow(DomainError)
    expect(material.estoque).toBe(2)
  })

  it('rejeita remover quantidade zero, negativa ou fracionada', () => {
    const material = criarFiltro()
    expect(() => material.removeEstoque(0)).toThrow(DomainError)
    expect(() => material.removeEstoque(-1)).toThrow(DomainError)
    expect(() => material.removeEstoque(1.5)).toThrow(DomainError)
  })

  it('adiciona ao estoque', () => {
    const material = criarFiltro(2)
    material.addEstoque(5)
    expect(material.estoque).toBe(7)
  })

  it('rejeita adicionar quantidade zero, negativa ou fracionada', () => {
    const material = criarFiltro()
    expect(() => material.addEstoque(0)).toThrow(DomainError)
    expect(() => material.addEstoque(-1)).toThrow(DomainError)
    expect(() => material.addEstoque(1.5)).toThrow(DomainError)
  })
})

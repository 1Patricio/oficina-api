import { DomainError } from '../../../../shared/domain/domain-error'
import { MaterialNecessario } from '../material-necessario'

const materialId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'

describe('MaterialNecessario', () => {
  it('cria com o material e a quantidade', () => {
    const material = MaterialNecessario.create(materialId, 2)
    expect(material.materialId).toBe(materialId)
    expect(material.quantidade).toBe(2)
  })

  it('rejeita quantidade zero, negativa ou fracionada', () => {
    expect(() => MaterialNecessario.create(materialId, 0)).toThrow(DomainError)
    expect(() => MaterialNecessario.create(materialId, 1.5)).toThrow(DomainError)
  })
})

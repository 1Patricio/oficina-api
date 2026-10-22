import { DomainError } from '../../../../shared/domain/domain-error'
import { Veiculo } from '../veiculo'

describe('Veiculo', () => {
  it('cria com ano, marca e modelo', () => {
    const veiculo = Veiculo.create(2010, 'Volkswagen', 'Gol')
    expect(veiculo.ano).toBe(2010)
    expect(veiculo.marca).toBe('Volkswagen')
    expect(veiculo.modelo).toBe('Gol')
  })

  it('gera um id diferente para cada veículo', () => {
    const primeiro = Veiculo.create(2010, 'Volkswagen', 'Gol')
    const segundo = Veiculo.create(2010, 'Volkswagen', 'Gol')
    expect(primeiro.id).not.toBe(segundo.id)
  })

  it('rejeita marca vazia', () => {
    expect(() => Veiculo.create(2010, '  ', 'Gol')).toThrow(DomainError)
  })

  it('rejeita modelo vazio', () => {
    expect(() => Veiculo.create(2010, 'Volkswagen', '  ')).toThrow(DomainError)
  })

  it('restaura com o id e os dados informados', () => {
    const id = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
    const veiculo = Veiculo.restore(id, 2010, 'Volkswagen', 'Gol')
    expect(veiculo.id).toBe(id)
    expect(veiculo.ano).toBe(2010)
    expect(veiculo.marca).toBe('Volkswagen')
    expect(veiculo.modelo).toBe('Gol')
  })

  it('rejeita restaurar com dados inválidos', () => {
    const id = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
    expect(() => Veiculo.restore(id, 2010, '  ', 'Gol')).toThrow(DomainError)
    expect(() => Veiculo.restore(id, 2010, 'Volkswagen', '  ')).toThrow(DomainError)
  })
})

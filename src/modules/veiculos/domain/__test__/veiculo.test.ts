import { DomainError } from '../../../../shared/domain/domain-error'
import { Placa } from '../../../../shared/domain/placa'
import { Veiculo } from '../veiculo'

const placa = Placa.create('ABC1234')

describe('Veiculo', () => {
  it('cria com ano, marca e modelo', () => {
    const veiculo = Veiculo.create(placa, 2010, 'Volkswagen', 'Gol')
    expect(veiculo.ano).toBe(2010)
    expect(veiculo.marca).toBe('Volkswagen')
    expect(veiculo.modelo).toBe('Gol')
  })

  it('cria sem cliente por padrão', () => {
    expect(Veiculo.create(placa, 2010, 'Volkswagen', 'Gol').clienteId).toBeNull()
  })

  it('cria vinculado ao cliente informado', () => {
    const clienteId = '9c3aea20-5c38-4162-84d9-4e67f461997f'
    expect(Veiculo.create(placa, 2010, 'Volkswagen', 'Gol', clienteId).clienteId).toBe(clienteId)
  })

  it('gera um id diferente para cada veículo', () => {
    const primeiro = Veiculo.create(placa, 2010, 'Volkswagen', 'Gol')
    const segundo = Veiculo.create(placa, 2010, 'Volkswagen', 'Gol')
    expect(primeiro.id).not.toBe(segundo.id)
  })

  it('rejeita marca vazia', () => {
    expect(() => Veiculo.create(placa, 2010, '  ', 'Gol')).toThrow(DomainError)
  })

  it('rejeita modelo vazio', () => {
    expect(() => Veiculo.create(placa, 2010, 'Volkswagen', '  ')).toThrow(DomainError)
  })

  it('restaura com o id e os dados informados', () => {
    const id = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
    const deletedAt = new Date('2026-10-30T12:00:00Z')
    const veiculo = Veiculo.restore(id, placa, 2010, 'Volkswagen', 'Gol', null, deletedAt)

    expect(veiculo.id).toBe(id)
    expect(veiculo.placa.equals(placa)).toBe(true)
    expect(veiculo.ano).toBe(2010)
    expect(veiculo.marca).toBe('Volkswagen')
    expect(veiculo.modelo).toBe('Gol')
    expect(veiculo.deletedAt).toBe(deletedAt)
  })

  it('rejeita restaurar com dados inválidos', () => {
    const id = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
    expect(() => Veiculo.restore(id, placa, 2010, '  ', 'Gol', null, null)).toThrow(DomainError)
    expect(() => Veiculo.restore(id, placa, 2010, 'Volkswagen', '  ', null, null)).toThrow(
      DomainError,
    )
  })

  it('atualiza placa, ano, marca, modelo e cliente', () => {
    const veiculo = Veiculo.create(placa, 2010, 'Volkswagen', 'Gol')
    const outraPlaca = Placa.create('BRA2E19')
    const clienteId = '9c3aea20-5c38-4162-84d9-4e67f461997f'

    veiculo.update(outraPlaca, 2015, 'Fiat', 'Uno', clienteId)

    expect(veiculo.placa.equals(outraPlaca)).toBe(true)
    expect(veiculo.ano).toBe(2015)
    expect(veiculo.marca).toBe('Fiat')
    expect(veiculo.modelo).toBe('Uno')
    expect(veiculo.clienteId).toBe(clienteId)
  })

  it('rejeita atualizar com dados inválidos', () => {
    const veiculo = Veiculo.create(placa, 2010, 'Volkswagen', 'Gol')

    expect(() => veiculo.update(placa, 2010, '  ', 'Gol', null)).toThrow(DomainError)
    expect(() => veiculo.update(placa, 2010, 'Volkswagen', '  ', null)).toThrow(DomainError)
  })

  it('marca a data da exclusão', () => {
    const veiculo = Veiculo.create(placa, 2010, 'Volkswagen', 'Gol')
    const data = new Date('2026-10-30T12:00:00Z')

    veiculo.delete(data)

    expect(veiculo.deletedAt).toBe(data)
  })
})

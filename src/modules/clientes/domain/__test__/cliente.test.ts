import { Documento } from '../../../../shared/domain/documento'
import { DomainError } from '../../../../shared/domain/domain-error'
import { Cliente } from '../cliente'

const documento = Documento.create('529.982.247-25')

describe('Cliente', () => {
  it('cria com documento e nome', () => {
    const cliente = Cliente.create(documento, 'Maria Silva', 'maria@email.com')
    expect(cliente.documento.equals(documento)).toBe(true)
    expect(cliente.nome).toBe('Maria Silva')
  })

  it('gera um id diferente para cada cliente', () => {
    const primeiro = Cliente.create(documento, 'Maria Silva', 'maria@email.com')
    const segundo = Cliente.create(documento, 'Maria Silva', 'maria@email.com')
    expect(primeiro.id).not.toBe(segundo.id)
  })

  it('rejeita nome vazio', () => {
    expect(() => Cliente.create(documento, '  ', 'maria@email.com')).toThrow(DomainError)
  })

  it('restaura com o id e os dados informados', () => {
    const id = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
    const deletedAt = new Date('2026-10-30T12:00:00Z')
    const cliente = Cliente.restore(id, documento, 'Maria Silva', 'maria@email.com', deletedAt)

    expect(cliente.id).toBe(id)
    expect(cliente.documento.equals(documento)).toBe(true)
    expect(cliente.nome).toBe('Maria Silva')
    expect(cliente.email).toBe('maria@email.com')
    expect(cliente.deletedAt).toBe(deletedAt)
  })

  it('atualiza documento, nome e e-mail', () => {
    const cliente = Cliente.create(documento, 'Maria Silva', 'maria@email.com')
    const outroDocumento = Documento.create('111.444.777-35')

    cliente.update(outroDocumento, 'Maria Souza', 'maria.souza@email.com')

    expect(cliente.documento.equals(outroDocumento)).toBe(true)
    expect(cliente.nome).toBe('Maria Souza')
    expect(cliente.email).toBe('maria.souza@email.com')
  })

  it('rejeita atualizar com nome vazio', () => {
    const cliente = Cliente.create(documento, 'Maria Silva', 'maria@email.com')
    expect(() => cliente.update(documento, '  ', 'maria@email.com')).toThrow(DomainError)
  })

  it('marca a data da exclusão', () => {
    const cliente = Cliente.create(documento, 'Maria Silva', 'maria@email.com')
    const data = new Date('2026-10-30T12:00:00Z')

    cliente.delete(data)

    expect(cliente.deletedAt).toBe(data)
  })
})

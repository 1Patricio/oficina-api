import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { DomainError } from '../../../../shared/domain/domain-error'
import { MaterialNecessario } from '../material-necessario'
import { Servico } from '../servico'

const preco = Dinheiro.fromCents(15000)
const oleo = MaterialNecessario.create('6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d', 1)
const filtro = MaterialNecessario.create('0a9b8c7d-6e5f-4a3b-8c2d-1e0f9a8b7c6d', 1)

describe('Servico', () => {
  it('cria com nome, descrição, preço e materiais necessários', () => {
    const servico = Servico.create('Troca óleo', 'Troca de óleo com 1L de óleo', preco, [
      oleo,
      filtro,
    ])
    expect(servico.nome).toBe('Troca óleo')
    expect(servico.descricao).toBe('Troca de óleo com 1L de óleo')
    expect(servico.preco.equals(preco)).toBe(true)
    expect(servico.materiais).toEqual([oleo, filtro])
  })

  it('cria sem materiais necessários', () => {
    expect(Servico.create('Alinhamento', 'Alinhamento das rodas', preco).materiais).toEqual([])
  })

  it('gera um id diferente para cada serviço', () => {
    const primeiro = Servico.create('Troca óleo', 'Troca de óleo com 1L de óleo', preco)
    const segundo = Servico.create('Troca freio', 'Troca de freio com modelos procedentes', preco)
    expect(primeiro.id).not.toBe(segundo.id)
  })

  it('rejeita nome vazio', () => {
    expect(() => Servico.create('  ', 'Troca de óleo com 1L de óleo', preco)).toThrow(DomainError)
  })

  it('rejeita o mesmo material repetido', () => {
    expect(() => Servico.create('Troca óleo', 'Troca de óleo', preco, [oleo, oleo])).toThrow(
      DomainError,
    )
  })

  it('restaura com o id e os dados informados', () => {
    const id = '3b2a1c0d-9e8f-4a7b-8c6d-5e4f3a2b1c0d'
    const servico = Servico.restore(id, 'Troca óleo', 'Troca de óleo com 1L de óleo', preco, [oleo])
    expect(servico.id).toBe(id)
    expect(servico.nome).toBe('Troca óleo')
    expect(servico.descricao).toBe('Troca de óleo com 1L de óleo')
    expect(servico.preco.equals(preco)).toBe(true)
    expect(servico.materiais).toEqual([oleo])
  })
})

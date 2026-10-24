import { Servico } from '../servico'

describe('Servico', () => {
  it('gera um ir diferente para cada serviço', () => {
    const primeiro = Servico.create('Troca óleo', 'Troca de óleo com 1L de óleo')
    const segundo = Servico.create('Troca freio', 'Troca de freio com modelos procedentes')
    expect(primeiro.id).not.toBe(segundo.id)
  })
})

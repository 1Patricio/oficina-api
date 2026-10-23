import { Documento } from '../documento'
import { DomainError } from '../domain-error'

describe('Documento', () => {
  it('aceita CPF e remove a máscara', () => {
    expect(Documento.create('529.982.247-25').value).toBe('52998224725')
  })

  it('aceita CNPJ e remove a máscara', () => {
    expect(Documento.create('11.222.333/0001-81').value).toBe('11222333000181')
  })

  it('rejeita documento inválido', () => {
    expect(() => Documento.create('123.456.789-00')).toThrow(DomainError)
  })

  it('igual a outro com o mesmo valor', () => {
    expect(Documento.create('529.982.247-25').equals(Documento.create('52998224725'))).toBe(true)
  })

  it('diferente de outro com valor diferente', () => {
    expect(Documento.create('529.982.247-25').equals(Documento.create('11222333000181'))).toBe(
      false,
    )
  })
})

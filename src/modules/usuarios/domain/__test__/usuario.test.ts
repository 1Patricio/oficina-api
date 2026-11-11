import { DomainError } from '../../../../shared/domain/domain-error'
import { Usuario } from '../usuario'

describe('Usuario', () => {
  it('cria com o e-mail em minúsculas e sem espaços', () => {
    const mockUsuario = Usuario.create('Administrador', '  Admin@Oficina.Local ', 'hash')

    expect(mockUsuario.email).toBe('admin@oficina.local')
  })

  it('rejeita nome vazio', () => {
    expect(() => Usuario.create('  ', 'admin@oficina.local', 'hash')).toThrow(DomainError)
  })
})

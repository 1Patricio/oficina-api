import bcryptjs from 'bcryptjs'
import { InMemoryUsuarioRepository } from '../../__test__/double/in-memory-usuario.repository'
import { Usuario } from '../../domain/usuario'
import { CreateAdmin } from '../create-admin.use-case'

const fakeAdmin = {
  nome: 'Administrador',
  email: 'Admin@Oficina.Local',
  senha: 'admin12345',
}

describe('CreateAdmin', () => {
  let repository: InMemoryUsuarioRepository
  let createAdmin: CreateAdmin

  beforeEach(() => {
    repository = new InMemoryUsuarioRepository()
    createAdmin = new CreateAdmin(repository)
  })

  it('salva o administrador com o e-mail normalizado e a senha em hash', async () => {
    await createAdmin.execute(fakeAdmin)

    const salvo = await repository.findByEmail('admin@oficina.local')
    expect(await bcryptjs.compare('admin12345', salvo?.senha ?? '')).toBe(true)
  })

  it('mantém o usuário existente sem alterar a senha', async () => {
    const existingUsuario = Usuario.create('Administrador', 'admin@oficina.local', 'hash-antigo')
    await repository.save(existingUsuario)

    await createAdmin.execute(fakeAdmin)

    expect(repository.usuarios).toHaveLength(1)
    expect(repository.usuarios[0].senha).toBe('hash-antigo')
  })
})

import { JwtService } from '@nestjs/jwt'
import bcryptjs from 'bcryptjs'
import { InMemoryUsuarioRepository } from '../../__test__/double/in-memory-usuario.repository'
import { Usuario } from '../../domain/usuario'
import { AuthenticateUsuario } from '../authenticate-usuario.use-case'

describe('AuthenticateUsuario', () => {
  it('devolve um token do usuário quando e-mail e senha conferem', async () => {
    const repository = new InMemoryUsuarioRepository()
    const jwtService = new JwtService({ secret: 'segredo-de-teste' })
    const authenticateUsuario = new AuthenticateUsuario(repository, jwtService)

    const mockUsuario = Usuario.create(
      'Administrador',
      'admin@oficina.local',
      await bcryptjs.hash('admin12345', 4),
    )

    await repository.save(mockUsuario)

    const { token } = await authenticateUsuario.execute({
      email: ' Admin@Oficina.Local ',
      senha: 'admin12345',
    })

    const payload = await jwtService.verifyAsync(token)

    expect(payload.sub).toBe(mockUsuario.id)
  })
})

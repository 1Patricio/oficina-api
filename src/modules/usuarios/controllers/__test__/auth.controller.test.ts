import type { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import bcryptjs from 'bcryptjs'
import request from 'supertest'
import { AppModule } from '../../../../app.module'
import { PrismaService } from '../../../../core/database/prisma.service'
import { InMemoryUsuarioRepository } from '../../__test__/double/in-memory-usuario.repository'
import { UsuarioRepository } from '../../domain/repositories/usuario.repository'
import { Usuario } from '../../domain/usuario'

describe('POST /auth/login', () => {
  let app: INestApplication
  let administrador: Usuario

  beforeAll(async () => {
    const repository = new InMemoryUsuarioRepository()

    administrador = Usuario.create(
      'Administrador',
      'admin@oficina.local',
      await bcryptjs.hash('admin12345', 4),
    )
    await repository.save(administrador)

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(UsuarioRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('responde 200 com o token do usuário', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@oficina.local', senha: 'admin12345' })

    expect(response.status).toBe(200)

    const payload = await app.get(JwtService).verifyAsync(response.body.token)

    expect(payload.sub).toBe(administrador.id)
  })

  it('responde 401 quando a senha não confere', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@oficina.local', senha: 'senha-errada' })

    expect(response.status).toBe(401)
    expect(response.body.message).toBe('E-mail/senha incorretos.')
  })
})

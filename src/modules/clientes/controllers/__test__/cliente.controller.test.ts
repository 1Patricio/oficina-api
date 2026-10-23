import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../../../app.module'
import { PrismaService } from '../../../../core/database/prisma.service'
import { InMemoryClienteRepository } from '../../__test__/double/in-memory-cliente.repository'
import { ClienteRepository } from '../../domain/repositories/cliente.repository'

const fakeCliente = {
  documento: '529.982.247-25',
  nome: 'Maria Silva',
}

describe('POST /clientes', () => {
  let app: INestApplication
  let repository: InMemoryClienteRepository

  beforeEach(async () => {
    repository = new InMemoryClienteRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(ClienteRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 201 com o id e salva o cliente', async () => {
    const response = await request(app.getHttpServer()).post('/clientes').send(fakeCliente)

    expect(response.status).toBe(201)

    const salvo = await repository.findById(response.body.id)
    expect(salvo?.nome).toBe('Maria Silva')
  })
})

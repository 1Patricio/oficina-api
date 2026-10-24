import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../../../app.module'
import { PrismaService } from '../../../../core/database/prisma.service'
import { Documento } from '../../../../shared/domain/documento'
import { InMemoryClienteRepository } from '../../__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../domain/cliente'
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

describe('GET /clientes', () => {
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

  it('responde 200 com a página pedida e o documento em texto', async () => {
    await repository.save(Cliente.create(Documento.create('111.444.777-35'), 'João Souza'))
    const maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')
    await repository.save(maria)

    const response = await request(app.getHttpServer()).get('/clientes').query({ page: 2, rpp: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      page: 2,
      rpp: 1,
      more: false,
      list: [{ id: maria.id, nome: 'Maria Silva', documento: '52998224725' }],
    })
  })
})

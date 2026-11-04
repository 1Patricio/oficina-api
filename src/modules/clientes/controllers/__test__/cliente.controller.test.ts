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

describe('GET /clientes/:id', () => {
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

  it('responde 200 com o cliente e o documento em texto', async () => {
    const maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')
    await repository.save(maria)

    const response = await request(app.getHttpServer()).get(`/clientes/${maria.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: maria.id, nome: 'Maria Silva', documento: '52998224725' })
  })

  it('responde 404 quando o cliente não existe', async () => {
    const response = await request(app.getHttpServer()).get(
      '/clientes/6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d',
    )

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Cliente não encontrado.')
  })
})

describe('PUT /clientes/:id', () => {
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

  it('responde 204 e atualiza o cliente', async () => {
    const maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')

    await repository.save(maria)

    const response = await request(app.getHttpServer()).put(`/clientes/${maria.id}`).send({
      documento: '529.982.247-25',
      nome: 'Maria Souza',
    })

    expect(response.status).toBe(204)
    expect(maria.nome).toBe('Maria Souza')
  })
})

describe('DELETE /clientes/:id', () => {
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

  it('responde 204 e marca o cliente como excluído', async () => {
    const maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')

    await repository.save(maria)

    const response = await request(app.getHttpServer()).delete(`/clientes/${maria.id}`)

    expect(response.status).toBe(204)
    expect(maria.deletedAt).toBeInstanceOf(Date)
  })
})

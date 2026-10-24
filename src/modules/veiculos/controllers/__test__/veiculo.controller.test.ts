import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../../../app.module'
import { PrismaService } from '../../../../core/database/prisma.service'
import { Documento } from '../../../../shared/domain/documento'
import { Placa } from '../../../../shared/domain/placa'
import { InMemoryClienteRepository } from '../../../clientes/__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../../clientes/domain/cliente'
import { ClienteRepository } from '../../../clientes/domain/repositories/cliente.repository'
import { InMemoryVeiculoRepository } from '../../__test__/double/in-memory-veiculo.repository'
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository'
import { Veiculo } from '../../domain/veiculo'

const fakeVeiculo = {
  placa: 'ABC1234',
  ano: 2010,
  marca: 'Volkswagen',
  modelo: 'Gol',
}

describe('POST /veiculos', () => {
  let app: INestApplication
  let repository: InMemoryVeiculoRepository
  let clienteRepository: InMemoryClienteRepository

  beforeEach(async () => {
    repository = new InMemoryVeiculoRepository()
    clienteRepository = new InMemoryClienteRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(VeiculoRepository)
      .useValue(repository)
      .overrideProvider(ClienteRepository)
      .useValue(clienteRepository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 201 com o id e salva o veículo', async () => {
    const response = await request(app.getHttpServer()).post('/veiculos').send(fakeVeiculo)

    expect(response.status).toBe(201)

    const salvo = await repository.findById(response.body.id)
    expect(salvo?.ano).toBe(2010)
    expect(salvo?.marca).toBe('Volkswagen')
    expect(salvo?.modelo).toBe('Gol')
  })

  it('responde 201 vinculando o veículo ao cliente', async () => {
    const maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')
    await clienteRepository.save(maria)

    const response = await request(app.getHttpServer())
      .post('/veiculos')
      .send({ ...fakeVeiculo, clienteId: maria.id })

    expect(response.status).toBe(201)

    const salvo = await repository.findById(response.body.id)
    expect(salvo?.clienteId).toBe(maria.id)
  })

  it('responde 404 quando o cliente não existe', async () => {
    const response = await request(app.getHttpServer())
      .post('/veiculos')
      .send({ ...fakeVeiculo, clienteId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Cliente não encontrado.')
    expect(repository.veiculos).toHaveLength(0)
  })

  it('responde 400 quando falta um campo', async () => {
    const { marca, ...semMarca } = fakeVeiculo

    const response = await request(app.getHttpServer()).post('/veiculos').send(semMarca)

    expect(response.status).toBe(400)
    expect(repository.veiculos).toHaveLength(0)
  })

  it('responde 400 quando um campo tem o tipo errado', async () => {
    const response = await request(app.getHttpServer())
      .post('/veiculos')
      .send({ ...fakeVeiculo, ano: '2010' })

    expect(response.status).toBe(400)
    expect(repository.veiculos).toHaveLength(0)
  })

  it('responde 422 quando o domínio recusa a marca', async () => {
    const response = await request(app.getHttpServer())
      .post('/veiculos')
      .send({ ...fakeVeiculo, marca: '  ' })

    expect(response.status).toBe(422)
    expect(response.body.message).toBe('Marca não informada.')
    expect(repository.veiculos).toHaveLength(0)
  })

  it('responde 422 quando o domínio recusa o modelo', async () => {
    const response = await request(app.getHttpServer())
      .post('/veiculos')
      .send({ ...fakeVeiculo, modelo: '  ' })

    expect(response.status).toBe(422)
    expect(response.body.message).toBe('Modelo não informado.')
    expect(repository.veiculos).toHaveLength(0)
  })
})

describe('GET /veiculos', () => {
  let app: INestApplication
  let repository: InMemoryVeiculoRepository

  beforeEach(async () => {
    repository = new InMemoryVeiculoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(VeiculoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 200 com a página pedida e a placa em texto', async () => {
    await repository.save(Veiculo.create(Placa.create('DEF5678'), 2015, 'Fiat', 'Uno'))
    const gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol')
    await repository.save(gol)

    const response = await request(app.getHttpServer()).get('/veiculos').query({ page: 2, rpp: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      page: 2,
      rpp: 1,
      more: false,
      list: [
        {
          id: gol.id,
          placa: 'ABC1234',
          ano: 2010,
          marca: 'Volkswagen',
          modelo: 'Gol',
          clienteId: null,
        },
      ],
    })
  })
})

describe('GET /veiculos/:id', () => {
  let app: INestApplication
  let repository: InMemoryVeiculoRepository

  beforeEach(async () => {
    repository = new InMemoryVeiculoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(VeiculoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 200 com o veículo e a placa em texto', async () => {
    const gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol')
    await repository.save(gol)

    const response = await request(app.getHttpServer()).get(`/veiculos/${gol.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: gol.id,
      placa: 'ABC1234',
      ano: 2010,
      marca: 'Volkswagen',
      modelo: 'Gol',
      clienteId: null,
    })
  })

  it('responde 404 quando o veículo não existe', async () => {
    const response = await request(app.getHttpServer()).get(
      '/veiculos/6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d',
    )

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Veículo não encontrado.')
  })
})

import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../../../app.module'
import { PrismaService } from '../../../../core/database/prisma.service'
import { InMemoryVeiculoRepository } from '../../__test__/double/in-memory-veiculo.repository'
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository'

const fakeVeiculo = {
  ano: 2010,
  marca: 'Volkswagen',
  modelo: 'Gol',
}

describe('POST /veiculos', () => {
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

  it('responde 201 com o id e salva o veículo', async () => {
    const response = await request(app.getHttpServer()).post('/veiculos').send(fakeVeiculo)

    expect(response.status).toBe(201)

    const salvo = await repository.findById(response.body.id)
    expect(salvo?.ano).toBe(2010)
    expect(salvo?.marca).toBe('Volkswagen')
    expect(salvo?.modelo).toBe('Gol')
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

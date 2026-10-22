import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../../../app.module'
import { PrismaService } from '../../../../core/database/prisma.service'
import { InMemoryMaterialRepository } from '../../__test__/double/in-memory-material.repository'
import { MaterialRepository } from '../../domain/repositories/material.repository'

const fakeMaterial = {
  nome: 'Filtro de óleo',
  precoUnitario: 45.9,
  estoque: 10,
}

describe('POST /materiais', () => {
  let app: INestApplication
  let repository: InMemoryMaterialRepository

  beforeEach(async () => {
    repository = new InMemoryMaterialRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(MaterialRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 201 com o id e salva o material', async () => {
    const response = await request(app.getHttpServer()).post('/materiais').send(fakeMaterial)

    expect(response.status).toBe(201)

    const material = await repository.findById(response.body.id)
    expect(material?.nome).toBe('Filtro de óleo')
    expect(material?.precoUnitario.cents).toBe(4590)
    expect(material?.estoque).toBe(10)
  })

  it('responde 400 quando falta um campo', async () => {
    const { nome, ...semNome } = fakeMaterial

    const response = await request(app.getHttpServer()).post('/materiais').send(semNome)

    expect(response.status).toBe(400)
    expect(repository.materiais).toHaveLength(0)
  })

  it('responde 400 quando um campo tem o tipo errado', async () => {
    const response = await request(app.getHttpServer())
      .post('/materiais')
      .send({ ...fakeMaterial, estoque: 1.5 })

    expect(response.status).toBe(400)
    expect(repository.materiais).toHaveLength(0)
  })

  it('responde 422 quando o domínio recusa o preço', async () => {
    const response = await request(app.getHttpServer())
      .post('/materiais')
      .send({ ...fakeMaterial, precoUnitario: -1 })

    expect(response.status).toBe(422)
    expect(response.body.message).toBe('Valor inválido.')
    expect(repository.materiais).toHaveLength(0)
  })

  it('responde 422 quando o domínio recusa o nome', async () => {
    const response = await request(app.getHttpServer())
      .post('/materiais')
      .send({ ...fakeMaterial, nome: '  ' })

    expect(response.status).toBe(422)
    expect(response.body.message).toBe('Nome não informado.')
    expect(repository.materiais).toHaveLength(0)
  })
})

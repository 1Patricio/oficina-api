import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../../../app.module'
import { PrismaService } from '../../../../core/database/prisma.service'
import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { InMemoryMaterialRepository } from '../../../estoque/__test__/double/in-memory-material.repository'
import { Material } from '../../../estoque/domain/material'
import { MaterialRepository } from '../../../estoque/domain/repositories/material.repository'
import { InMemoryServicoRepository } from '../../__test__/double/in-memory-servico.repository'
import { ServicoRepository } from '../../domain/repositories/servico.repository'
import { Servico } from '../../domain/servico'

const preco = Dinheiro.fromCents(15000)

describe('POST /servicos', () => {
  let app: INestApplication
  let repository: InMemoryServicoRepository
  let oleo: Material

  const fakeServico = () => ({
    nome: 'Troca de óleo',
    descricao: 'Troca de óleo com 1L de óleo',
    preco: 150,
    materiais: [{ materialId: oleo.id, quantidade: 1 }],
  })

  beforeEach(async () => {
    repository = new InMemoryServicoRepository()
    const materialRepository = new InMemoryMaterialRepository()
    oleo = Material.create('Óleo 5W30', Dinheiro.fromCents(3500), 10)
    await materialRepository.save(oleo)

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(ServicoRepository)
      .useValue(repository)
      .overrideProvider(MaterialRepository)
      .useValue(materialRepository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 201 com o id e salva o serviço com os materiais', async () => {
    const response = await request(app.getHttpServer()).post('/servicos').send(fakeServico())

    expect(response.status).toBe(201)

    const servico = await repository.findById(response.body.id)
    expect(servico?.nome).toBe('Troca de óleo')
    expect(servico?.preco.cents).toBe(15000)
    expect(servico?.materiais.map((material) => material.materialId)).toEqual([oleo.id])
  })

  it('responde 400 quando os materiais não são objetos', async () => {
    const response = await request(app.getHttpServer())
      .post('/servicos')
      .send({ ...fakeServico(), materiais: [oleo.id] })

    expect(response.status).toBe(400)
    expect(repository.servicos).toHaveLength(0)
  })

  it('responde 404 quando o material não existe', async () => {
    const response = await request(app.getHttpServer())
      .post('/servicos')
      .send({
        ...fakeServico(),
        materiais: [{ materialId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d', quantidade: 1 }],
      })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Material não encontrado.')
    expect(repository.servicos).toHaveLength(0)
  })
})

describe('GET /servicos', () => {
  let app: INestApplication
  let repository: InMemoryServicoRepository

  beforeEach(async () => {
    repository = new InMemoryServicoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(ServicoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 200 com a página pedida e o preço em reais', async () => {
    await repository.save(Servico.create('Alinhamento', 'Alinhamento das rodas', preco))
    const troca = Servico.create('Troca de óleo', 'Troca com 1L de óleo', preco)
    await repository.save(troca)

    const response = await request(app.getHttpServer()).get('/servicos').query({ page: 2, rpp: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      page: 2,
      rpp: 1,
      more: false,
      list: [
        {
          id: troca.id,
          nome: 'Troca de óleo',
          descricao: 'Troca com 1L de óleo',
          preco: 150,
          materiais: [],
        },
      ],
    })
  })
})

describe('GET /servicos/:id', () => {
  let app: INestApplication
  let repository: InMemoryServicoRepository

  beforeEach(async () => {
    repository = new InMemoryServicoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(ServicoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 200 com o serviço e o preço em reais', async () => {
    const troca = Servico.create('Troca de óleo', 'Troca com 1L de óleo', preco)
    await repository.save(troca)

    const response = await request(app.getHttpServer()).get(`/servicos/${troca.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: troca.id,
      nome: 'Troca de óleo',
      descricao: 'Troca com 1L de óleo',
      preco: 150,
      materiais: [],
    })
  })

  it('responde 404 quando o serviço não existe', async () => {
    const response = await request(app.getHttpServer()).get(
      '/servicos/6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d',
    )

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Serviço não encontrado.')
  })
})

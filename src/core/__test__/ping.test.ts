import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../app.module'

describe('GET /ping', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('responde 200 com status ok e a data atual', async () => {
    const response = await request(app.getHttpServer()).get('/ping')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(Number.isNaN(Date.parse(response.body.dateTime))).toBe(false)
  })
})

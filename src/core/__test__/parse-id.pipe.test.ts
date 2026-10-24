import type { ArgumentMetadata } from '@nestjs/common'
import { ParseIdPipe } from '../parse-id.pipe'

describe('ParseIdPipe', () => {
  it('responde 400 com a mensagem em português para um id que não é UUID', async () => {
    const metadata: ArgumentMetadata = { type: 'param', data: 'id' }

    await expect(new ParseIdPipe().transform('abc', metadata)).rejects.toMatchObject({
      status: 400,
      message: 'Id inválido.',
    })
  })
})

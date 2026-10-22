import type { ArgumentsHost } from '@nestjs/common'
import { DomainError } from '../../shared/domain/domain-error'
import { NotFoundError } from '../../shared/domain/not-found-error'
import { DomainErrorFilter } from '../domain-error.filter'

function criarContexto() {
  const response = { status: vi.fn(), json: vi.fn() }
  response.status.mockReturnValue(response)
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost
  return { response, host }
}

describe('DomainErrorFilter', () => {
  it('responde 422 com a mensagem para um erro de domínio', () => {
    const { response, host } = criarContexto()

    new DomainErrorFilter().catch(new DomainError('Nome não informado.'), host)

    expect(response.status).toHaveBeenCalledWith(422)
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: 'Nome não informado.',
    })
  })

  it('responde 404 com a mensagem para um erro de não encontrado', () => {
    const { response, host } = criarContexto()

    new DomainErrorFilter().catch(
      new NotFoundError('Material não encontrado.'),
      host,
    )

    expect(response.status).toHaveBeenCalledWith(404)
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 404,
      error: 'Not Found',
      message: 'Material não encontrado.',
    })
  })
})

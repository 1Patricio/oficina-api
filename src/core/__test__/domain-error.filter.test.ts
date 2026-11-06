import type { ArgumentsHost } from '@nestjs/common'
import { ConflictError } from '../../shared/domain/conflict-error'
import { DomainError } from '../../shared/domain/domain-error'
import { NotFoundError } from '../../shared/domain/not-found-error'
import { NotificacaoError } from '../../shared/domain/notificacao-error'
import { DomainErrorFilter } from '../domain-error.filter'

function createContext() {
  const response = { status: vi.fn(), json: vi.fn() }
  response.status.mockReturnValue(response)
  const context = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost
  return { response, context }
}

describe('DomainErrorFilter', () => {
  it('responde 422 com a mensagem para um erro de domínio', () => {
    const { response, context } = createContext()

    new DomainErrorFilter().catch(new DomainError('Nome não informado.'), context)

    expect(response.status).toHaveBeenCalledWith(422)
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: 'Nome não informado.',
    })
  })

  it('responde 404 com a mensagem para um erro de não encontrado', () => {
    const { response, context } = createContext()

    new DomainErrorFilter().catch(new NotFoundError('Material não encontrado.'), context)

    expect(response.status).toHaveBeenCalledWith(404)
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 404,
      error: 'Not Found',
      message: 'Material não encontrado.',
    })
  })

  it('responde 409 com a mensagem para um erro de conflito', () => {
    const { response, context } = createContext()

    new DomainErrorFilter().catch(new ConflictError('Cliente já cadastrado.'), context)

    expect(response.status).toHaveBeenCalledWith(409)
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 409,
      error: 'Conflict',
      message: 'Cliente já cadastrado.',
    })
  })

  it('responde 502 com a mensagem para um erro de notificação', () => {
    const { response, context } = createContext()

    new DomainErrorFilter().catch(new NotificacaoError('E-mail não enviado.'), context)

    expect(response.status).toHaveBeenCalledWith(502)
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 502,
      error: 'Bad Gateway',
      message: 'E-mail não enviado.',
    })
  })
})

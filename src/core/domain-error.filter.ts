import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import type { Response } from 'express'
import { DomainError } from '../shared/domain/domain-error'
import { NotFoundError } from '../shared/domain/not-found-error'

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    const exception =
      error instanceof NotFoundError
        ? new NotFoundException(error.message)
        : new UnprocessableEntityException(error.message)

    response.status(exception.getStatus()).json(exception.getResponse())
  }
}

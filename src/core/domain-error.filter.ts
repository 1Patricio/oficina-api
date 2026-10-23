import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import type { Response } from 'express'
import { ConflictError } from '../shared/domain/conflict-error'
import { DomainError } from '../shared/domain/domain-error'
import { NotFoundError } from '../shared/domain/not-found-error'

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    const exception = toHttpException(error)

    response.status(exception.getStatus()).json(exception.getResponse())
  }
}

function toHttpException(error: DomainError) {
  if (error instanceof NotFoundError) return new NotFoundException(error.message)
  if (error instanceof ConflictError) return new ConflictException(error.message)
  return new UnprocessableEntityException(error.message)
}

import { Module } from '@nestjs/common'
import { ClienteController } from './controllers/cliente.controller'
import { ClienteRepository } from './domain/repositories/cliente.repository'
import { PrismaClienteRepository } from './infra/repositories/prisma-cliente.repository'
import { CreateCliente } from './use-cases/create-cliente.use-case'

@Module({
  controllers: [ClienteController],
  providers: [{ provide: ClienteRepository, useClass: PrismaClienteRepository }, CreateCliente],
})
export class ClienteModule {}

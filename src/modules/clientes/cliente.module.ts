import { Module } from '@nestjs/common'
import { ClienteController } from './controllers/cliente.controller'
import { ClienteRepository } from './domain/repositories/cliente.repository'
import { PrismaClienteRepository } from './infra/repositories/prisma-cliente.repository'
import { CreateCliente } from './use-cases/create-cliente.use-case'
import { DeleteCliente } from './use-cases/delete-cliente.use-case'
import { GetCliente } from './use-cases/get-cliente.use-case'
import { ListClientes } from './use-cases/list-clientes.use-case'
import { UpdateCliente } from './use-cases/update-cliente.use-case'

@Module({
  controllers: [ClienteController],
  providers: [
    { provide: ClienteRepository, useClass: PrismaClienteRepository },
    CreateCliente,
    ListClientes,
    GetCliente,
    UpdateCliente,
    DeleteCliente,
  ],
  exports: [ClienteRepository],
})
export class ClienteModule {}

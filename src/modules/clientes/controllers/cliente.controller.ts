import { Body, Controller, Inject, Post } from '@nestjs/common'
import { CreateCliente } from '../use-cases/create-cliente.use-case'
import { CreateClienteDTO } from './dtos/create-cliente.dto'

@Controller('/clientes')
export class ClienteController {
  @Inject(CreateCliente)
  private readonly createCliente: CreateCliente

  @Post('/')
  create(@Body() cliente: CreateClienteDTO) {
    return this.createCliente.execute(cliente)
  }
}

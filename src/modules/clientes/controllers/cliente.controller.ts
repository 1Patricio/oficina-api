import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { CreateCliente } from '../use-cases/create-cliente.use-case'
import { ListClientes } from '../use-cases/list-clientes.use-case'
import { CreateClienteDTO } from './dtos/create-cliente.dto'
import { ListClientesQueryDTO } from './dtos/list-clientes-query.dto'

@Controller('/clientes')
export class ClienteController {
  @Inject(CreateCliente)
  private readonly createCliente: CreateCliente

  @Inject(ListClientes)
  private readonly listClientes: ListClientes

  @Post('/')
  create(@Body() cliente: CreateClienteDTO) {
    return this.createCliente.execute(cliente)
  }

  @Get('/')
  list(@Query() query: ListClientesQueryDTO) {
    return this.listClientes.execute({ page: query.page, rpp: query.rpp, term: query.nome })
  }
}

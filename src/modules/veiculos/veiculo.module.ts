import { Module } from '@nestjs/common'
import { ClienteModule } from '../clientes/cliente.module'
import { VeiculoController } from './controllers/veiculo.controller'
import { VeiculoRepository } from './domain/repositories/veiculo.repository'
import { PrismaVeiculoRepository } from './infra/repositories/prisma-veiculo.repository'
import { CreateVeiculo } from './use-cases/create-veiculo.use-case'
import { GetVeiculo } from './use-cases/get-veiculo.use-case'
import { ListVeiculos } from './use-cases/list-veiculos.use-case'

@Module({
  imports: [ClienteModule],
  controllers: [VeiculoController],
  providers: [
    { provide: VeiculoRepository, useClass: PrismaVeiculoRepository },
    CreateVeiculo,
    ListVeiculos,
    GetVeiculo,
  ],
  exports: [VeiculoRepository],
})
export class VeiculoModule {}

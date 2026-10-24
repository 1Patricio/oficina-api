import { Module } from '@nestjs/common'
import { VeiculoController } from './controllers/veiculo.controller'
import { VeiculoRepository } from './domain/repositories/veiculo.repository'
import { PrismaVeiculoRepository } from './infra/repositories/prisma-veiculo.repository'
import { CreateVeiculo } from './use-cases/create-veiculo.use-case'
import { GetVeiculo } from './use-cases/get-veiculo.use-case'
import { ListVeiculos } from './use-cases/list-veiculos.use-case'

@Module({
  controllers: [VeiculoController],
  providers: [
    { provide: VeiculoRepository, useClass: PrismaVeiculoRepository },
    CreateVeiculo,
    ListVeiculos,
    GetVeiculo,
  ],
})
export class VeiculoModule {}

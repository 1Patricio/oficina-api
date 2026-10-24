import { Module } from '@nestjs/common'
import { VeiculoController } from './controllers/veiculo.controller'
import { VeiculoRepository } from './domain/repositories/veiculo.repository'
import { PrismaVeiculoRepository } from './infra/repositories/prisma-veiculo.repository'
import { CreateVeiculo } from './use-cases/create-veiculo.use-case'

@Module({
  controllers: [VeiculoController],
  providers: [{ provide: VeiculoRepository, useClass: PrismaVeiculoRepository }, CreateVeiculo],
})
export class VeiculoModule {}

import { Module } from '@nestjs/common'
import { PingController } from './core/ping.controller'
import { EstoqueModule } from './modules/estoque/estoque.module'

@Module({
  imports: [EstoqueModule],
  controllers: [PingController],
})
export class AppModule {}

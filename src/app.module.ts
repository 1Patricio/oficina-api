import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './core/database/database.module'
import { PingController } from './core/ping.controller'
import { EstoqueModule } from './modules/estoque/estoque.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EstoqueModule,
    DatabaseModule,
  ],
  controllers: [PingController],
})
export class AppModule {}

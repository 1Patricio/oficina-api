import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
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
  providers: [
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) },
  ],
})
export class AppModule {}

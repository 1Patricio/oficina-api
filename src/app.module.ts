import { Module } from '@nestjs/common'
import { PingController } from './core/ping.controller'

@Module({
  controllers: [PingController],
})
export class AppModule {}

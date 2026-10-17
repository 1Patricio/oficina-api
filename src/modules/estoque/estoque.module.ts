import { Module } from '@nestjs/common'
import { MateriaisController } from './controllers/materiais.controller'

@Module({
  controllers: [MateriaisController],
})
export class EstoqueModule {}

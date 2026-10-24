import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { DatabaseModule } from './core/database/database.module'
import { DomainErrorFilter } from './core/domain-error.filter'
import { PingController } from './core/ping.controller'
import { ClienteModule } from './modules/clientes/cliente.module'
import { EstoqueModule } from './modules/estoque/estoque.module'
import { ServicoModule } from './modules/servicos/servico.module'
import { VeiculoModule } from './modules/veiculos/veiculo.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ClienteModule,
    EstoqueModule,
    VeiculoModule,
    ServicoModule,
  ],
  controllers: [PingController],
  providers: [
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) },
    { provide: APP_FILTER, useClass: DomainErrorFilter },
  ],
})
export class AppModule {}

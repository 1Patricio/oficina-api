import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './controllers/auth.controller'
import { UsuarioRepository } from './domain/repositories/usuario.repository'
import { PrismaUsuarioRepository } from './infra/repositories/prisma-usuario.repository'
import { AuthenticateUsuario } from './use-cases/authenticate-usuario.use-case'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: UsuarioRepository, useClass: PrismaUsuarioRepository },
    AuthenticateUsuario,
  ],
  exports: [UsuarioRepository],
})
export class UsuarioModule {}

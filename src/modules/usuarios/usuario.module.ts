import { Module } from '@nestjs/common'
import { AuthController } from './controllers/auth.controller'
import { UsuarioRepository } from './domain/repositories/usuario.repository'
import { PrismaUsuarioRepository } from './infra/repositories/prisma-usuario.repository'
import { AuthenticateUsuario } from './use-cases/authenticate-usuario.use-case'

@Module({
  controllers: [AuthController],
  providers: [
    { provide: UsuarioRepository, useClass: PrismaUsuarioRepository },
    AuthenticateUsuario,
  ],
  exports: [UsuarioRepository],
})
export class UsuarioModule {}

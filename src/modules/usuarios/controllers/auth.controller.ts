import { Body, Controller, Inject, Post } from '@nestjs/common'
import { AuthenticateUsuario } from '../use-cases/authenticate-usuario.use-case'
import { LoginDTO } from './dtos/login.dto'

@Controller('/auth')
export class AuthController {
  @Inject(AuthenticateUsuario)
  private authenticateUsuario: AuthenticateUsuario

  @Post('/login')
  login(@Body() login: LoginDTO) {
    return this.authenticateUsuario.execute(login)
  }
}

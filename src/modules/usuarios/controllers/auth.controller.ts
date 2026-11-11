import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthenticateUsuario } from '../use-cases/authenticate-usuario.use-case'
import { LoginDTO } from './dtos/login.dto'

@ApiTags('Autenticação')
@Controller('/auth')
export class AuthController {
  @Inject(AuthenticateUsuario)
  private readonly authenticateUsuario: AuthenticateUsuario

  @Post('/login')
  @HttpCode(200)
  login(@Body() login: LoginDTO) {
    return this.authenticateUsuario.execute(login)
  }
}

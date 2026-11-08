import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcryptjs from 'bcryptjs'
import { UsuarioRepository } from '../domain/repositories/usuario.repository'

type Request = {
  email: string
  senha: string
}

type Response = {
  token: string
}

@Injectable()
export class AuthenticateUsuario {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ email, senha }: Request): Promise<Response> {
    const usuario = await this.usuarioRepository.findByEmail(email.trim().toLowerCase())

    if (!usuario) {
      throw new UnauthorizedException('E-mail/senha incorretos.')
    }

    const passwordMatches = await bcryptjs.compare(senha, usuario.senha)

    if (!passwordMatches) {
      throw new UnauthorizedException('E-mail/senha incorretos.')
    }

    const token = await this.jwtService.signAsync({ sub: usuario.id })

    return { token }
  }
}

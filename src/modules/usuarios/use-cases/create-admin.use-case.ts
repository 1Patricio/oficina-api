import { Injectable } from '@nestjs/common'
import bcryptjs from 'bcryptjs'
import { UsuarioRepository } from '../domain/repositories/usuario.repository'
import { Usuario } from '../domain/usuario'

type Request = {
  nome: string
  email: string
  senha: string
}

@Injectable()
export class CreateAdmin {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute({ nome, email, senha }: Request): Promise<void> {
    const existingUsuario = await this.usuarioRepository.findByEmail(Usuario.normalizeEmail(email))

    if (existingUsuario) return

    const usuario = Usuario.create(nome, email, await bcryptjs.hash(senha, 10))
    await this.usuarioRepository.save(usuario)
  }
}

import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../core/database/prisma.service'
import type { UsuarioModel } from '../../../../generated/prisma/models'
import { UsuarioRepository } from '../../domain/repositories/usuario.repository'
import { Usuario } from '../../domain/usuario'

@Injectable()
export class PrismaUsuarioRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(usuario: Usuario): Promise<void> {
    const data = {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
    }

    await this.prisma.usuario.upsert({
      where: { id: usuario.id },
      create: { id: usuario.id, ...data },
      update: data,
    })
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } })
    return usuario ? toDomain(usuario) : null
  }
}

function toDomain(usuario: UsuarioModel): Usuario {
  return Usuario.restore(usuario.id, usuario.nome, usuario.email, usuario.senha)
}

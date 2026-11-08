import { UsuarioRepository } from '../../domain/repositories/usuario.repository'
import { Usuario } from '../../domain/usuario'

export class InMemoryUsuarioRepository extends UsuarioRepository {
  private readonly itens = new Map<string, Usuario>()

  get usuarios(): Usuario[] {
    return [...this.itens.values()]
  }

  save(usuario: Usuario): Promise<void> {
    this.itens.set(usuario.id, usuario)
    return Promise.resolve()
  }

  findByEmail(email: string): Promise<Usuario | null> {
    const usuario = this.usuarios.find((item) => item.email === email)
    return Promise.resolve(usuario ?? null)
  }
}

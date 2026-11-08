import { Usuario } from '../usuario'

export abstract class UsuarioRepository {
  abstract save(usuario: Usuario): Promise<void>
  abstract findByEmail(email: string): Promise<Usuario | null>
}

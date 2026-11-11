import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JwtAuthGuard } from '../jwt-auth.guard'

function contextWithAuthorization(authorization?: string) {
  const getRequest = () => ({ headers: { authorization } })
  return { switchToHttp: () => ({ getRequest }) } as ExecutionContext
}

describe('JwtAuthGuard', () => {
  const jwtService = new JwtService({ secret: 'segredo-de-teste' })
  const guard = new JwtAuthGuard(jwtService)

  it('libera quando o token é válido', async () => {
    const token = await jwtService.signAsync({ sub: 'usuario-id' })

    const liberado = await guard.canActivate(contextWithAuthorization(`Bearer ${token}`))

    expect(liberado).toBe(true)
  })

  it('bloqueia quando não há token', async () => {
    const bloqueado = guard.canActivate(contextWithAuthorization())

    await expect(bloqueado).rejects.toThrow(UnauthorizedException)
  })

  it('bloqueia quando o token é inválido', async () => {
    const bloqueado = guard.canActivate(contextWithAuthorization('Bearer token-invalido'))

    await expect(bloqueado).rejects.toThrow(UnauthorizedException)
  })
})

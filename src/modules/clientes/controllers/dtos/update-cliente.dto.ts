import { IsEmail, IsString } from 'class-validator'

export class UpdateClienteDTO {
  @IsString()
  documento: string

  @IsString()
  nome: string

  @IsEmail()
  email: string
}

import { IsString } from 'class-validator'

export class CreateClienteDTO {
  @IsString()
  documento: string

  @IsString()
  nome: string
}

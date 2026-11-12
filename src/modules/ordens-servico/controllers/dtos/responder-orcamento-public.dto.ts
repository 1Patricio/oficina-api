import { IsString } from 'class-validator'

export class ResponderOrcamentoPublicDTO {
  @IsString()
  documento: string

  @IsString()
  placa: string
}

import { IsInt, IsNumber, IsString } from 'class-validator'

export class CreateMaterialDTO {
  @IsString()
  nome: string

  @IsNumber()
  precoUnitario: number

  @IsInt()
  estoque: number
}

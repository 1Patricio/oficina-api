import { IsInt, IsNumber, IsString } from 'class-validator'

export class UpdateMaterialDTO {
  @IsString()
  nome: string

  @IsNumber()
  precoUnitario: number

  @IsInt()
  estoque: number
}

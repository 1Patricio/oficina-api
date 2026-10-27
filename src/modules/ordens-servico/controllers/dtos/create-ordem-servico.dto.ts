import { Type } from 'class-transformer'
import { IsArray, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'

export class MaterialOrdemServicoDTO {
  @IsUUID()
  materialId: string

  @IsInt()
  quantidade: number
}

export class CreateOrdemServicoDTO {
  @IsString()
  documento: string

  @IsUUID()
  veiculoId: string

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  servicoIds?: string[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialOrdemServicoDTO)
  materiais?: MaterialOrdemServicoDTO[]
}

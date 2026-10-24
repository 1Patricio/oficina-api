import { IsOptional, IsString } from 'class-validator'
import { PageQueryDTO } from '../../../../core/page-query.dto'

export class ListVeiculosQueryDTO extends PageQueryDTO {
  @IsOptional()
  @IsString()
  busca?: string
}

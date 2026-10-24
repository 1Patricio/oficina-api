import { IsOptional, IsString } from 'class-validator'
import { PageQueryDTO } from '../../../../core/page-query.dto'

export class ListMateriaisQueryDTO extends PageQueryDTO {
  @IsOptional()
  @IsString()
  nome?: string
}

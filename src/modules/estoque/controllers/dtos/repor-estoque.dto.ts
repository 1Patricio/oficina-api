import { IsInt } from 'class-validator'

export class ReporEstoqueDTO {
  @IsInt()
  quantidade: number
}

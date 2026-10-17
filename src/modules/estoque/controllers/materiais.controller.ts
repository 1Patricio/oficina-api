import { Controller, Get, Query } from '@nestjs/common'

@Controller('/materiais')
export class MateriaisController {
  @Get('/')
  list(@Query('term') term?: string) {
    return []
  }
}

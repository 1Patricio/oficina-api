import { Body, Controller, Inject, Post } from '@nestjs/common'
import { CreateMaterial } from '../use-cases/create-material.use-case'
import { CreateMaterialDTO } from './dtos/create-material.dto'

@Controller('/materiais')
export class MateriaisController {
  @Inject(CreateMaterial)
  private readonly createMaterial: CreateMaterial

  @Post('/')
  create(@Body() material: CreateMaterialDTO) {
    return this.createMaterial.execute(material)
  }
}

import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { CreateAdmin } from './modules/usuarios/use-cases/create-admin.use-case'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] })
  const config = app.get(ConfigService)

  await app.get(CreateAdmin).execute({
    nome: config.getOrThrow('ADMIN_NOME'),
    email: config.getOrThrow('ADMIN_EMAIL'),
    senha: config.getOrThrow('ADMIN_PASSWORD'),
  })

  const documentConfig = new DocumentBuilder()
    .setTitle('Oficina API')
    .setDescription(
      'Sistema Integrado de Atendimento e Execução de Serviços de uma oficina mecânica.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build()
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, documentConfig))

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap().catch((erro) => {
  console.error(erro)
  process.exit(1)
})

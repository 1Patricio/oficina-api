import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] })
  await app.listen(process.env.PORT ?? 3000)
}

bootstrap().catch((erro) => {
  console.error(erro)
  process.exit(1)
})

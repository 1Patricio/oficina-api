import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// biome-ignore lint/style/noDefaultExport: formato exigido pelo Prisma
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
})

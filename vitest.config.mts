import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

// biome-ignore lint/style/noDefaultExport: formato exigido pelo Vitest
export default defineConfig({
  // O transform padrão do Vite não emite metadata de decorators, e a injeção
  // de dependência do Nest depende dela. Por isso o TypeScript passa pelo SWC.
  esbuild: false,
  oxc: false,
  test: {
    globals: true,
    environment: 'node',
    root: '.',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', 'src/**/__test__/**'],
      reporter: ['text', 'html'],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
        target: 'es2023',
        keepClassNames: true,
      },
    }),
  ],
})

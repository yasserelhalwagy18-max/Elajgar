import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
      // `server-only` throws unless the bundler sets the "react-server"
      // condition. Vitest runs in a plain node environment, so point it at the
      // no-op build.
      'server-only': fileURLToPath(new URL('./node_modules/server-only/empty.js', import.meta.url)),
    },
  },
  // `tsconfig.json` sets `jsx: "preserve"`, which Next.js needs, but it
  // leaves the JSX in the file for the bundler to deal with. Vitest has no
  // React plugin, so the JSX is compiled here instead.
  oxc: {
    jsx: { runtime: 'automatic' },
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
  },
})

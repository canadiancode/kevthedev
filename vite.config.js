import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Every HTML page gets its own entry. Its folder becomes its URL on Cloudflare Pages,
// e.g. instructions/local-models/index.html -> /instructions/local-models/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        localModels: resolve(import.meta.dirname, 'instructions/local-models/index.html'),
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: { outDir: 'dist/store' },
  resolve: { alias: { '@shared': path.resolve(__dirname, 'src/shared') } },
  server: { host: true, port: 3001, open: false }
})

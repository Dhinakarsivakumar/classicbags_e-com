import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'admin-index-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '') {
            req.url = '/admin.html'
          }
          next()
        })
      }
    }
  ],
  root: '.',
  build: { outDir: 'dist/admin', rollupOptions: { input: 'admin.html' } },
  resolve: { alias: { '@shared': path.resolve(__dirname, 'src/shared') } },
  server: { host: true, port: 3002, open: false }
})

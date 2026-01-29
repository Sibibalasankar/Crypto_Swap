import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Changed from 5173 to 3000
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Rutas relativas: el build funciona en GitHub Pages (/<repo>/) o en cualquier carpeta.
  base: './',
  plugins: [react()],
})

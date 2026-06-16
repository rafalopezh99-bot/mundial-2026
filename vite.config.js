import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cambia '/App_Mundial/' por el nombre de tu repositorio en GitHub
// Ejemplo: si tu repo se llama 'mundial-2026', pon '/mundial-2026/'
export default defineConfig({
  plugins: [react()],
  base: '/mundial-2026/',
})

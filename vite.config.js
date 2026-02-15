import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Este archivo solo debe contener la configuración de Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})

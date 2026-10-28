import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Los estilos se escriben en SASS (sintaxis indentada, `.sass`) y cada
  // componente importa su propio `.styles.sass`. No hay Tailwind.
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      sass: { style: 'expanded' },
      scss: { style: 'expanded' },
    },
  },

  server: {
    port: 5173,
    // El frontend llama a `/api/...` y Vite lo reenvía al API Go (backend/).
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isPages = mode === 'pages'

  return {
    plugins: [react(), tailwindcss()],
    base: isPages ? '/SNCF-Tracc-View/' : '/',
    define: isPages
      ? {
          'import.meta.env.VITE_DATA_MODE': JSON.stringify('static'),
          'import.meta.env.VITE_DATA_BASE': JSON.stringify('/SNCF-Tracc-View/data'),
        }
      : {},
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  }
})

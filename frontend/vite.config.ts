import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    server: {
      host: true,
      port: parseInt(env.VITE_DEV_PORT || '3000'),
      proxy: {
        '/api': {
          target: `http://${env.VITE_BACKEND_HOST || 'localhost'}:${env.VITE_BACKEND_PORT || '8000'}`,
          changeOrigin: true,
        },
        '/ws': {
          target: `ws://${env.VITE_BACKEND_HOST || 'localhost'}:${env.VITE_BACKEND_PORT || '8000'}`,
          ws: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
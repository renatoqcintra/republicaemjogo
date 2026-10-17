import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// A mesma configuração serve para a versão web e, futuramente, para o empacotamento
// desktop via Tauri (o plugin do Tauri será acrescentado apenas na etapa desktop).
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});

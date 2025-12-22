import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    root: './', // Keep root at project root
    publicDir: './public', // Look for public dir at root
    build: {
      outDir: 'dist', // Output to dist at root
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@frontend': path.resolve(__dirname, './src/frontend'),
        '@backend': path.resolve(__dirname, './src/backend'),
        '@components': path.resolve(__dirname, './src/frontend/components'),
        '@contexts': path.resolve(__dirname, './src/frontend/contexts'),
        '@types': path.resolve(__dirname, './src/types'),
        '@shared': path.resolve(__dirname, './src/shared'),
      },
    },
  };
});

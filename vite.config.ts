import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

// ----------------------------------------------------------------------

const PORT = 3000;

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // Agrega este plugin
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: { 
    port: PORT, 
    host: true,
    allowedHosts: ["linkercodisa.codisa.com.py"], // Agrega el host permitido aquí
    proxy: {
      '/api': {
        target: 'http://181.40.93.42:9003/backend-linker',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  preview: { port: PORT, host: true ,
    allowedHosts: ["linkercodisa.codisa.com.py"] // Agrega el host permitido aquí

  },
});

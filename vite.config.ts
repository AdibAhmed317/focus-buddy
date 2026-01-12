import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    {
      name: 'copy-manifest',
      writeBundle() {
        const manifest = path.resolve(__dirname, 'manifest.json');
        const dest = path.resolve(__dirname, 'dist', 'manifest.json');
        fs.copyFileSync(manifest, dest);
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'popup.html'),
        background: path.resolve(__dirname, 'src/background.ts'),
        offscreen: path.resolve(__dirname, 'offscreen.html'),
        index: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
}));

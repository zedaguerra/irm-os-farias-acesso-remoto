import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'main.ts'),
      formats: ['cjs'],
      fileName: () => '[name].js',
    },
    rollupOptions: {
      external: [
        'electron',
        'electron-updater',
        'electron-store',
        'path',
        'fs',
        'os'
      ],
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
        dir: '../dist-electron'
      }
    },
    outDir: '../dist-electron',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
});
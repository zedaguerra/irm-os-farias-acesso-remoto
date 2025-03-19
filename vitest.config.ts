import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { coverageThreshold } from './src/test/coverage-threshold';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types/',
      ],
      thresholds: coverageThreshold
    },
    globals: true,
    include: ['src/**/*.test.{ts,tsx}']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/test-setup.ts'],
    css: true,
    // Suppress act() warnings from React Testing Library - these are often false positives
    // when using waitFor() and async operations, which are already properly handled
    silent: false, // Keep this false to see real errors, but we suppress specific warnings in setup
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'e2e/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/messages/**',
        '**/i18n/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    include: ['**/__tests__/**/*.{ts,tsx}', '**/tests/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules/',
      'e2e/',
      '.next/',
      'dist/',
      'build/',
      'tests/setup/**',
      'tests/mocks/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
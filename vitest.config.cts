import path from 'node:path';
import { defineConfig } from 'vitest/config';

const vitestConfig = defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'build/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
        'tests/**',
        // Exclude schema definition files (no logic to test)
        'src/utils/**',
        'src/schemas/**',
        // Exclude server entry points (tested via integration)
        'src/index.ts',
        'src/serverHttp.ts',
        // Exclude script files
        'src/scripts/**',
      ],
      include: ['src/**/*.ts'],
      // Floors at the measured baseline: coverage may rise, never drop.
      thresholds: {
        lines: 86,
        functions: 76,
        branches: 82,
        statements: 86,
      },
    },
    // Unit suite only. The hermetic integration suite runs via its own config —
    // `pnpm run test:integration` (vitest.integration.config.cts) and CI's test.yml.
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['node_modules', 'build', 'dist', 'tests/integration/**'],
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});

module.exports = vitestConfig;

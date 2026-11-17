import path from 'node:path';
import { defineConfig } from 'vitest/config';

const vitestConfig = defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@tests': path.resolve(import.meta.dirname, './tests'),
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
        'src/shared/api-status-feed.ts',
        'src/shared/cli-output.ts',
        'src/shared/cli-ui.ts',
        'src/shared/date-converter.ts',
        'src/shared/entry-module.ts',
        'src/shared/env-file.ts',
        'src/shared/env-parser.ts',
        'src/shared/errors.ts',
        'src/shared/http.ts',
        'src/shared/llm-client-detector.ts',
        'src/shared/local-feed-files.ts',
        'src/shared/local-media.ts',
        'src/shared/log-redaction.ts',
        'src/shared/logger.ts',
        'src/shared/objects.ts',
        'src/shared/schema-helpers.ts',
        'src/shared/token-utils.ts',
        'src/shared/type-guards.ts',
        'src/shared/version.ts',
        'src/shared/zod-issues.ts',
        'src/ebay-apis/trading/trading-helpers.ts',
        'src/ebay-apis/communication/feedback-helpers.ts',
        'src/ebay-apis/communication/message-helpers.ts',
        'src/ebay-apis/communication/negotiation-helpers.ts',
        'src/ebay-apis/communication/notification-helpers.ts',
        'src/ebay-apis/other/identity/identity-helpers.ts',
        'src/ebay-apis/other/translation/translation-helpers.ts',
        'src/ebay-apis/other/vero/vero-helpers.ts',
        'src/shared/ebay.ts',
        'src/shared/ebay-enums.ts',
        'src/shared/index.ts',
        'src/ebay-openapi-types/**',
        'src/ebay-apis/**/*-schemas.ts',
        // Exclude server entry points (tested via integration)
        'src/index.ts',
        'src/server-http.ts',
        // Exclude script files
        'scripts/**',
        'src/cli/**',
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

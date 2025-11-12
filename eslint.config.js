// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginN from 'eslint-plugin-n';
import vitest from 'eslint-plugin-vitest';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // Ignore patterns
  {
    ignores: [
      'build/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'docs/**',
      '*.config.js',
      '*.config.mjs',
      'scripts/**',
      // Generated OpenAPI types
      'src/types/sell_*.ts',
      'src/types/commerce_*.ts',
    ],
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Node.js plugin recommended rules
  pluginN.configs['flat/recommended-module'],

  // Global configuration
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // ===== TypeScript Rules =====
      // Disabled: too many warnings in existing codebase, not critical for runtime safety
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Disabled: too strict for API integration code where any is sometimes necessary
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      // Keep critical async/promise safety rules
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      // Disabled: unbound-method causes too many false positives with axios and class methods
      '@typescript-eslint/unbound-method': 'off',

      // ===== Node.js Rules =====
      'n/no-missing-import': 'off', // Handled by TypeScript
      'n/no-unsupported-features/es-syntax': 'off', // We use ES modules
      'n/no-unsupported-features/node-builtins': [
        'error',
        {
          version: '>=18.0.0',
        },
      ],
      'n/no-process-exit': 'off', // Allow process.exit in CLI tools

      // ===== General Best Practices =====
      'no-console': 'off', // Allow console logging in server code
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'off', // Disabled: too strict, Error wrapping not always needed
      'no-return-await': 'off', // Conflicts with @typescript-eslint/return-await
      '@typescript-eslint/return-await': 'off', // Disabled: not critical

      // ===== Code Style =====
      // Disabled: naming-convention too strict for API integration code
      '@typescript-eslint/naming-convention': 'off',

      // ===== Security Best Practices =====
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      '@typescript-eslint/no-implied-eval': 'error',

      // ===== Performance =====
      // Disabled: prefer-nullish-coalescing not critical, || is acceptable
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // ===== Error Handling =====
      '@typescript-eslint/only-throw-error': 'error',
      'no-promise-executor-return': 'off', // Disabled: sometimes intentional for timeout patterns
      '@typescript-eslint/require-await': 'off', // Disabled: interface compliance may require async
      '@typescript-eslint/no-empty-function': 'off', // Allow empty functions for default handlers
    },
  },

  // Test files specific configuration
  {
    files: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Disable rules that conflict with Prettier
  eslintConfigPrettier,
);

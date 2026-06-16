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
      'smoke-test-trading.mjs',
      'scripts/**',
      // Browser-targeted MCP Apps views (DOM/Bundler graph) — typechecked
      // separately via `npm run typecheck:ui` (tsconfig the flat config's
      // type-aware rules can't see), so exclude from the Node lint project.
      'ui/**',
      // Generated OpenAPI types
      'src/types/*.d.ts',
      'src/types/application-settings/**/*Oas3.ts',
      'src/types/sell-apps/**/*Oas3.ts',
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
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'warn',
        {
          allowNumber: true,
          allowBoolean: true,
          allowNullish: true,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

      // ===== Node.js Rules =====
      'n/no-missing-import': 'off', // Handled by TypeScript
      'n/no-unsupported-features/es-syntax': 'off', // We use ES modules
      'n/no-unsupported-features/node-builtins': [
        'error',
        {
          // `fetch` and its `Response` type are stable and fully functional on
          // Node 18 (the rule's default threshold is conservatively 21). The
          // project's HTTP layer (src/utils/http.ts) is built on them.
          version: '>=18.0.0',
          ignores: ['fetch', 'Response'],
        },
      ],
      'n/no-process-exit': 'warn',

      // ===== General Best Practices =====
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-return-await': 'off', // Conflicts with @typescript-eslint/return-await
      '@typescript-eslint/return-await': ['error', 'always'],

      // ===== Code Style =====
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'objectLiteralProperty',
          format: null, // Allow any format for object properties (for API responses)
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
      ],

      // ===== Security Best Practices =====
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      '@typescript-eslint/no-implied-eval': 'error',

      // ===== Performance =====
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // ===== Error Handling =====
      '@typescript-eslint/only-throw-error': 'error',
      'no-promise-executor-return': 'error',
    },
  },

  // Source entrypoints keep shebangs so emitted CLI scripts are directly runnable.
  {
    files: ['src/index.ts', 'src/scripts/*.ts'],
    rules: {
      'n/hashbang': 'off',
    },
  },

  // Test files specific configuration
  {
    files: ['tests/**/*.ts'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/require-await': 'off',
      'no-console': 'off',
    },
  },

  // Disable rules that conflict with Prettier
  eslintConfigPrettier,
);

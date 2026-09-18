import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**'],
  },

  js.configs.recommended,

  {
    files: ['src/**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',

      globals: {
        ...globals.browser,
      },
    },

    rules: {
      eqeqeq: ['error', 'always'],

      'no-console': 'off',

      'no-var': 'error',

      'prefer-const': 'warn',

      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['scripts/**/*.mjs'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node,
      },
    },
  },

  prettier,
];

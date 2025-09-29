import js from '@eslint/js';
import globals from 'globals';

const source = ['src/**/*.js'];
const ignores = [
  'node_modules/',
  'coverage/',
  'dist/',
  'build/',
  'src/vendor/',
  '.visual/',
  '.lighthouse/',
  '.wireit/',
  '.11ty-vite/'
];

const config = {
  files: [...source],
  ignores,
  rules: {
    ...js.configs.recommended.rules,
    'no-unused-vars': ['error', { varsIgnorePattern: '^_|Demo|Test|T' }]
  }
};

/** @type {import('eslint').Linter.Config[]} */
export const browserJavaScriptConfig = [
  {
    ignores // https://github.com/eslint/eslint/discussions/18304
  },
  {
    ...config,
    languageOptions: {
      globals: globals.browser
    }
  }
];

/** @type {import('eslint').Linter.Config[]} */
export const nodeJavaScriptConfig = [
  {
    ignores // https://github.com/eslint/eslint/discussions/18304
  },
  {
    ...config,
    languageOptions: {
      globals: globals.node
    }
  }
];

import js from '@eslint/js';
import globals from 'globals';

const source = ['**/src/**/*.js'];
const ignores = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.lighthouse/**', '**/.wireit/**'];

const config = {
  files: [...source],
  ignores: [...ignores],
  rules: {
    ...js.configs.recommended.rules,
    'no-unused-vars': ['error', { varsIgnorePattern: '^_|Demo|Test|T' }]
  }
};

/** @type {import('eslint').Linter.Config[]} */
export const browserJavaScriptConfig = [
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
    ...config,
    languageOptions: {
      globals: globals.node
    }
  }
];

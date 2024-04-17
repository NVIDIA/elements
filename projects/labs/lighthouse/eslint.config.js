import globals from 'globals';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

const source = ['**/src/**/*.js', '**/src/**/*.ts', '**/src/**/*.d.ts'];
const tests = ['**/*.test.ts'];
const ignores = ['**/node_modules/**', '**/dist/**', '**/coverage/**'];

export default [
  'eslint:recommended',
  {
    files: [...source, ...tests],
    ignores,
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.node
      }
    },
    rules: {
      ...typescript.configs.recommended.rules
    }
  }
];

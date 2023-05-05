import globals from 'globals';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import lit from 'eslint-plugin-lit';
import litA11y from 'eslint-plugin-lit-a11y';

const ignores = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/storybook-build/**'];

export default [
  'eslint:recommended',
  {
    files: ['**/*.ts', '**/*.d.ts'],
    ignores,
    plugins: {
      '@typescript-eslint': typescript,
      'lit-a11y': litA11y,
      lit,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...lit.configs.recommended.rules,
      ...litA11y.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off', // TODO: would like to enable
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: 'Demo|Test' }], // ignore demo/test components that do not need to be exported
      'lit-a11y/anchor-has-content': 'off', // rule does not check for aria-label
      'lit-a11y/click-events-have-key-events': 'off', // a11y may be handled by @keyNavigationList controller
      'no-unknown-slot': 'off', // currently not working due to pnpm hoisting types
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'lit/decorators', message: 'import individual decorators https://lit.dev/docs/components/decorators/#importing-decorators' },
            { name: 'lit/decorators.js', message: 'import individual decorators https://lit.dev/docs/components/decorators/#importing-decorators' }
          ],
          patterns: ['lit-element', 'lit-element/*', 'lit-html', 'lit-html/*'],
        },
      ],
    }
  }
];

import globals from 'globals';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import lit from 'eslint-plugin-lit';
import litA11y from 'eslint-plugin-lit-a11y';
import importPlugin from 'eslint-plugin-import';
import wc from 'eslint-plugin-wc';
import rulesdir from 'eslint-plugin-rulesdir';

rulesdir.RULES_DIR = '../../build/eslint';

const source = ['**/src/**/*.ts', '**/src/**/*.d.ts'];
const tests = ['**/src/test/*.ts', '**/*.test.ts', '**/*.test.axe.ts'];
const stories = ['**/*.stories.ts'];
const ignores = ['**/node_modules/**', '**/dist/**', '**/dist-storybook/**', '**/coverage/**', '**/.lighthouse/**'];

export default [
  'eslint:recommended',
  {
    files: [...source, ...tests, ...stories],
    ignores,
    plugins: {
      '@typescript-eslint': typescript,
      rulesdir: rulesdir,
      wc: wc,
      import: importPlugin,
      'lit-a11y': litA11y,
      lit
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
      ...litA11y.configs.recommended.rules,
      ...litA11y.configs.recommended.rules,
      'wc/no-constructor-attributes': ['error'],
      'wc/no-invalid-element-name': ['error'],
      'wc/no-self-class': ['error'],
      'wc/attach-shadow-constructor': ['error'],
      'wc/no-closed-shadow-root': ['error'],
      'wc/no-constructor-params': ['error'],
      'wc/no-typos': ['error'],
      'lit/attribute-value-entities': ['error'],
      'lit/binding-positions': ['error'],
      'lit/no-duplicate-template-bindings': ['error'],
      'lit/no-invalid-escape-sequences': ['error'],
      'lit/no-invalid-html': ['error'],
      'lit/no-legacy-imports': ['error'],
      'lit/no-legacy-template-syntax': ['error'],
      'lit/no-private-properties': ['error'],
      'lit/no-property-change-update': ['error'],
      'lit/no-template-arrow': ['off'], // TODO
      'lit/no-template-bind': ['error'],
      'lit/no-this-assign-in-render': ['off'], // TODO
      'lit/no-useless-template-literals': ['error'],
      'lit/no-value-attribute': ['error'],
      'lit/prefer-nothing': ['error'],
      'lit/quoted-expressions': ['off'],
      'lit/value-after-constraints': ['error'],
      'import/extensions': ['error', 'ignorePackages', { js: 'always', 'css?inline': 'never' }],
      '@typescript-eslint/no-explicit-any': 'off', // TODO
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: 'Demo|Test' }], // ignore demo/test components that do not need to be exported
      'lit-a11y/anchor-has-content': 'off', // rule does not check for aria-label
      'lit-a11y/click-events-have-key-events': 'off', // a11y may be handled by @keyNavigationList controller
      'no-unknown-slot': ['off'], // currently not working due to hoisting types
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lit/decorators',
              message: 'import individual decorators https://lit.dev/docs/components/decorators/#importing-decorators'
            },
            {
              name: 'lit/decorators.js',
              message: 'import individual decorators https://lit.dev/docs/components/decorators/#importing-decorators'
            }
          ],
          patterns: ['lit-element', 'lit-element/*', 'lit-html', 'lit-html/*', '@elements/elements/test']
        }
      ],
      'rulesdir/reserved-property-names': ['error'],
      'rulesdir/reserved-event-names': ['error'],
      'rulesdir/stateless-property': ['error']
    }
  },
  {
    files: [...source],
    ignores: [...ignores, ...stories],
    plugins: {
      lit
    },
    rules: {
      'lit/quoted-expressions': ['error']
    }
  },
  {
    files: [...source],
    ignores: [...ignores, ...tests, ...stories],
    rules: {
      '@typescript-eslint/no-floating-promises': ['error'],
      'rulesdir/primitive-property': ['error'],
      'no-implicit-globals': ['error'],
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'Use globalThis instead.' },
        { name: 'location', message: 'Use globalThis.location instead.' },
        { name: 'document', message: 'Use globalThis.document instead.' }
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@elements/elements/**/*.css',
                '@elements/elements/**/*.css?inline',
                '@nvidia-elements/core/**/*.css',
                '@nvidia-elements/core/**/*.css?inline'
              ],
              message:
                'inline CSS utils are not allowed in library APIs to prevent performance issues, use shadow DOM encapsulated CSS instead'
            }
          ]
        }
      ]
    }
  }
];

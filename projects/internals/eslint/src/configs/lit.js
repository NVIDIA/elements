import { resolve } from 'path';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import lit from 'eslint-plugin-lit';
import litA11y from 'eslint-plugin-lit-a11y';
import wc from 'eslint-plugin-wc';
import rulesdir from 'eslint-plugin-rulesdir';
import * as url from 'url';

const source = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.d.ts'];
const tests = [
  'src/test/*.ts',
  '**/*.test.ts',
  '**/*.test.visual.ts',
  '**/*.test.lighthouse.ts',
  '**/*.test.axe.ts',
  '**/*.test.ssr.ts'
];
const stories = ['**/*.stories.ts'];
const ignores = ['node_modules/', 'coverage/', 'dist/', 'build/', '.visual/', '.lighthouse/', '.wireit/'];

rulesdir.RULES_DIR = resolve(url.fileURLToPath(new URL('.', import.meta.url)), '../plugins');

/** @type {import('eslint').Linter.Config[]} */
export const litConfig = [
  {
    files: [...source, ...tests, ...stories],
    ignores,
    plugins: {
      rulesdir: rulesdir,
      wc: wc,
      'lit-a11y': litA11y,
      lit
    },
    languageOptions: {
      parser: tseslint.parser,
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
      'lit/quoted-expressions': ['error'],
      'lit/value-after-constraints': ['error'],
      'lit/no-complex-attribute-binding': ['off'], // rule is not working when type is being resolved from a generic type parameter
      'lit-a11y/anchor-has-content': 'off', // rule does not check for aria-label
      'lit-a11y/click-events-have-key-events': 'off', // a11y may be handled by @keyNavigationList controller
      'no-unknown-slot': ['off'], // currently not working due to hoisting types
      'rulesdir/reserved-property-names': ['error'],
      'rulesdir/reserved-event-names': ['error'],
      'rulesdir/stateless-property': ['error']
    }
  },
  {
    files: [...source],
    ignores: [...ignores, ...tests, ...stories],
    rules: {
      'rulesdir/primitive-property': ['error']
    }
  }
];

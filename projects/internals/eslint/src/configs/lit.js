import globals from 'globals';
import tseslint from 'typescript-eslint';
import lit from 'eslint-plugin-lit';
import litA11y from 'eslint-plugin-lit-a11y';
import wc from 'eslint-plugin-wc';
import html from '@html-eslint/eslint-plugin';
import reservedPropertyNames from '../local/reserved-property-names.js';
import primitiveProperty from '../local/primitive-property.js';
import reservedEventNames from '../local/reserved-event-names.js';
import statelessProperty from '../local/stateless-property.js';

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
const ignores = [
  'node_modules/',
  'coverage/',
  'dist/',
  'build/',
  'src/vendor/',
  '.visual/',
  '.lighthouse/',
  '.wireit/'
];

/** @type {import('eslint').Linter.Config[]} */
export const litConfig = [
  {
    ignores // https://github.com/eslint/eslint/discussions/18304
  },
  {
    files: [...source, ...tests, ...stories],
    ignores,
    plugins: {
      wc: wc,
      'lit-a11y': litA11y,
      lit,
      html,
      local: {
        rules: {
          'reserved-property-names': reservedPropertyNames,
          'primitive-property': primitiveProperty,
          'reserved-event-names': reservedEventNames,
          'stateless-property': statelessProperty
        }
      }
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
      'lit-a11y/anchor-has-content': ['off'], // rule does not check for aria-label
      'lit-a11y/click-events-have-key-events': ['off'], // a11y may be handled by @keyNavigationList controller
      ...html.configs.recommended.rules,
      'html/no-extra-spacing-text': ['off'], // todo: run lint:fix
      'html/indent': ['off', 2], // todo: run lint:fix
      'html/use-baseline': ['off'], // disabled we use chrome specific APIs with fallbacks
      'html/attrs-newline': ['off'], // disabled interferes with example templates
      'html/element-newline': ['off'], // disabled interferes with example templates
      'html/require-closing-tags': ['off'], // disabled interferes with example templates
      'html/no-extra-spacing-attrs': ['off'] // disabled interferes with example templates
    }
  },
  // library implementation files
  {
    files: [...source],
    ignores: [...ignores, ...tests, ...stories],
    rules: {
      'local/reserved-property-names': ['error'],
      'local/primitive-property': ['error'],
      'local/reserved-event-names': ['error'],
      'local/stateless-property': ['error']
    }
  }
];

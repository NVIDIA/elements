import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';

const source = ['src/**/*.html'];
const ignores = [
  'node_modules/',
  'coverage/',
  'dist/',
  'build/',
  '.visual/',
  '.lighthouse/',
  '.wireit/',
  'src/**/*.snippets.html'
];

/** @type {import('eslint').Linter.Config[]} */
export const htmlConfig = [
  {
    ...html.configs['flat/recommended'],
    languageOptions: {
      parser: htmlParser,
      parserOptions: {
        frontmatter: true
      }
    },
    files: [...source],
    ignores,
    rules: {
      ...html.configs['flat/recommended'].rules,
      '@html-eslint/require-title': 'off',
      '@html-eslint/no-extra-spacing-text': 'error',
      '@html-eslint/no-extra-spacing-attrs': 'error',
      '@html-eslint/require-closing-tags': 'off',
      '@html-eslint/indent': ['error', 2],
      '@html-eslint/attrs-newline': [
        'error',
        {
          closeStyle: 'sameline',
          ifAttrsMoreThan: 5
        }
      ]
    }
  }
];

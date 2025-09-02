import eslintHTML from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';

const source = ['src/**/*.html', 'src/**/*.11ty.js'];
const ignores = [
  'node_modules/',
  'coverage/',
  'dist/',
  'build/',
  '.visual/',
  '.lighthouse/',
  '.wireit/',
  '.11ty-vite/',
  'src/**/*.snippets.html'
];

/** @type {import('eslint').Linter.Config[]} */
export const htmlConfig = [
  {
    languageOptions: {
      parser: htmlParser,
      parserOptions: {
        frontmatter: true
      }
    },
    files: [...source],
    ignores,
    plugins: {
      '@html-eslint': eslintHTML
    },
    rules: {
      ...eslintHTML.configs.recommended.rules,
      '@html-eslint/require-doctype': 'off', // not accurate for templates
      '@html-eslint/require-title': 'off',
      '@html-eslint/no-extra-spacing-text': 'error',
      '@html-eslint/quotes': 'off', // prettier
      '@html-eslint/no-extra-spacing-attrs': 'off', // prettier
      '@html-eslint/indent': 'off', // prettier
      '@html-eslint/require-closing-tags': 'off', // prettier
      '@html-eslint/attrs-newline': [
        'error',
        {
          closeStyle: 'sameline',
          ifAttrsMoreThan: 10
        }
      ]
    }
  }
];

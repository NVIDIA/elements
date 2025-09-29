import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';

const source = [
  'src/**/*.html',
  'src/**/*.11ty.js',
  'src/**/*.examples.ts',
  'src/**/*.stories.ts',
  'src/**/*.stories.tsx'
];

const ignores = [
  'node_modules/',
  'coverage/',
  'dist/',
  'build/',
  'src/vendor/',
  '.visual/',
  '.lighthouse/',
  '.wireit/',
  '.11ty-vite/',
  'src/**/*.snippets.html'
];

/** @type {import('eslint').Linter.Config[]} */
export const htmlConfig = [
  {
    ignores // https://github.com/eslint/eslint/discussions/18304
  },
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
      html
    },
    rules: {
      ...html.configs.recommended.rules,
      'html/require-doctype': 'off', // not accurate for templates
      'html/require-title': 'off',
      'html/no-extra-spacing-text': 'error',
      'html/quotes': 'off', // prettier
      'html/no-extra-spacing-attrs': 'off', // prettier
      'html/indent': 'off', // prettier
      'html/require-closing-tags': 'off', // prettier
      'html/element-newline': 'off', // prettier
      'html/use-baseline': 'off', // disabled we use chrome specific APIs with fallbacks
      'html/attrs-newline': [
        'error',
        {
          closeStyle: 'sameline',
          ifAttrsMoreThan: 10
        }
      ]
    }
  }
];

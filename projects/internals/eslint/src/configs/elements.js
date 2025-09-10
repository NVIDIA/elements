import eslintHTML from '@html-eslint/eslint-plugin';
import eslintCSS from '@eslint/css';
import deprecatedTags from '../local/deprecated-tags.js';
import cssProperty from '../local/css-property.js';

const source = ['src/**/*.html', 'src/**/*.11ty.js', 'src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx'];
const cssSource = ['src/**/*.css'];
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
export const elementsConfig = [
  {
    files: [...source],
    ignores,
    plugins: {
      '@html-eslint': eslintHTML,
      elements: {
        rules: {
          'deprecated-tags': deprecatedTags
        }
      }
    },
    rules: {
      'elements/deprecated-tags': ['error'],
      '@html-eslint/no-restricted-attrs': [
        'error',
        {
          tagPatterns: ['.*-.*'],
          attrPatterns: ['nve-layout'],
          message: 'Use of nve-layout is not allowed on custom HTML element tags.'
        },
        {
          tagPatterns: ['.*-.*'],
          attrPatterns: ['nve-text'],
          message: 'Use of nve-text is not allowed on custom HTML element tags.'
        },
        {
          tagPatterns: ['.*-.*'],
          attrPatterns: ['mlv-text'],
          message: 'Use of mlv-text is not allowed, use nve-text instead.'
        },
        {
          tagPatterns: ['.*-.*'],
          attrPatterns: ['mlv-layout'],
          message: 'Use of mlv-layout is not allowed, use nve-layout instead.'
        },
        {
          tagPatterns: ['.*-.*'],
          attrPatterns: ['mlv-theme'],
          message: 'Use of mlv-theme is not allowed, use nve-theme instead.'
        }
      ],
      '@html-eslint/no-restricted-attr-values': [
        'off', // disabled, need to add custom rule matcher to prevent false positives on non icon elements
        {
          attrPatterns: ['name'],
          attrValuePatterns: [].map(i => `^${i}$`),
          message: 'Icon name {{attrValuePatterns}} is deprecated.'
        }
      ]
    }
  },
  {
    files: [...cssSource],
    ignores,
    plugins: {
      '@eslint/css': eslintCSS,
      elements: {
        rules: {
          'no-invalid-css-variable': cssProperty
        }
      }
    },
    language: '@eslint/css/css',
    languageOptions: {
      tolerant: true
    },
    rules: {
      'elements/no-invalid-css-variable': ['error']
    }
  }
];

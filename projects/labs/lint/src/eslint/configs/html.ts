import type { Linter } from 'eslint';
import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import noDeprecatedTags from '../rules/no-deprecated-tags.js';
import noDeprecatedAttributes from '../rules/no-deprecated-attributes.js';
import noDeprecatedIconNames from '../rules/no-deprecated-icon-names.js';
import noDeprecatedPopoverAttributes from '../rules/no-deprecated-popover-attributes.js';

const source = ['src/**/*.html', 'src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx'];

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

export const elementsHtmlConfig: Linter.Config = {
  files: [...source],
  ignores,
  languageOptions: {
    parser: htmlParser,
    parserOptions: {
      frontmatter: true
    }
  },
  plugins: {
    '@nvidia-elements/lint': {
      rules: {
        'no-restricted-attrs': html.rules['no-restricted-attrs'],
        'no-deprecated-tags': noDeprecatedTags,
        'no-deprecated-attributes': noDeprecatedAttributes,
        'no-deprecated-icon-names': noDeprecatedIconNames,
        'no-deprecated-popover-attributes': noDeprecatedPopoverAttributes
      }
    }
  },
  rules: {
    '@nvidia-elements/lint/no-deprecated-tags': ['error'],
    '@nvidia-elements/lint/no-deprecated-attributes': ['error'],
    '@nvidia-elements/lint/no-deprecated-icon-names': ['error'],
    '@nvidia-elements/lint/no-deprecated-popover-attributes': ['error'],
    '@nvidia-elements/lint/no-restricted-attrs': [
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
        attrPatterns: ['nve-text'],
        message: 'Use of nve-text is not allowed, use nve-text instead.'
      },
      {
        tagPatterns: ['.*-.*'],
        attrPatterns: ['nve-layout'],
        message: 'Use of nve-layout is not allowed, use nve-layout instead.'
      },
      {
        tagPatterns: ['.*-.*'],
        attrPatterns: ['nve-theme'],
        message: 'Use of nve-theme is not allowed, use nve-theme instead.'
      }
    ]
  }
};

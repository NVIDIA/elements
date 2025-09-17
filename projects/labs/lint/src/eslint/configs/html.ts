import type { Linter } from 'eslint';
import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import deprecatedTags from '../rules/deprecated-tags.js';

const source = ['src/**/*.html', 'src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx'];

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
        'no-restricted-attr-values': html.rules['no-restricted-attr-values'],
        'no-deprecated-tags': deprecatedTags
      }
    }
  },
  rules: {
    '@nvidia-elements/lint/no-deprecated-tags': ['error'],
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
    ]
    // '@nvidia-elements/lint/no-restricted-attr-values': [
    //   'off', // disabled, need to add custom rule matcher to prevent false positives on non icon elements
    //   {
    //     attrPatterns: ['name'],
    //     attrValuePatterns: [].map(i => `^${i}$`),
    //     message: 'Icon name {{attrValuePatterns}} is deprecated.'
    //   }
    // ]
  }
};

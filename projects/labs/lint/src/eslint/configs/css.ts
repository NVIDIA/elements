import type { Linter } from 'eslint';
import css from '@eslint/css';
import noUnexpectedCssVariable from '../rules/no-unexpected-css-variable.js';
import noUnexpectedCssValue from '../rules/no-unexpected-css-value.js';

const source = ['src/**/*.css'];
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

export const elementsCssConfig: Linter.Config = {
  files: [...source],
  ignores,
  language: 'css/css',
  languageOptions: {
    tolerant: true
  },
  plugins: {
    css,
    '@nvidia-elements/lint': {
      rules: {
        'no-unexpected-css-variable': noUnexpectedCssVariable,
        'no-unexpected-css-value': noUnexpectedCssValue
      }
    }
  },
  rules: {
    '@nvidia-elements/lint/no-unexpected-css-variable': ['error'],
    '@nvidia-elements/lint/no-unexpected-css-value': ['error']
  }
};

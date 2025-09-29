import type { Linter } from 'eslint';
import json from '@eslint/json';
import noUnexpectedLibraryDependencies from '../rules/no-unexpected-library-dependencies.js';

const source = ['package.json'];
const ignores = [
  'node_modules/',
  'coverage/',
  'dist/',
  'build/',
  'src/vendor/',
  '.visual/',
  '.lighthouse/',
  '.wireit/',
  '.11ty-vite/'
];

export const elementsJsonConfig: Linter.Config = {
  files: [...source],
  ignores,
  language: 'json/json',
  plugins: {
    json,
    '@nvidia-elements/lint': {
      rules: {
        'no-unexpected-library-dependencies': noUnexpectedLibraryDependencies
      }
    }
  },
  rules: {
    '@nvidia-elements/lint/no-unexpected-library-dependencies': ['error']
  }
};

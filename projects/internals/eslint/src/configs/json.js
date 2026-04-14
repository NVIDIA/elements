import json from '@eslint/json';
import noUnpinnedDependencyRanges from '../local/no-unpinned-dependency-ranges.js';

const source = ['package.json'];
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
export const jsonConfig = [
  {
    ignores // https://github.com/eslint/eslint/discussions/18304
  },
  {
    files: [...source],
    ignores,
    language: 'json/json',
    plugins: {
      json,
      'local-json': {
        rules: {
          'no-unpinned-dependency-ranges': noUnpinnedDependencyRanges
        }
      }
    },
    rules: {
      'local-json/no-unpinned-dependency-ranges': ['error']
    }
  }
];

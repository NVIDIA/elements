import json from '@eslint/json';
import noUnpinnedDependencyRanges from '../local/no-unpinned-dependency-ranges.js';
import requireHtmlCustomDataContract from '../local/require-html-custom-data-contract.js';

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
          'no-unpinned-dependency-ranges': noUnpinnedDependencyRanges,
          'require-html-custom-data-contract': requireHtmlCustomDataContract
        }
      }
    },
    rules: {
      'local-json/no-unpinned-dependency-ranges': ['error'],
      'local-json/require-html-custom-data-contract': ['error']
    }
  }
];
